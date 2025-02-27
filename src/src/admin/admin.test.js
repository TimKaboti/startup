import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Admin } from '/Admin.jsx';
import ringsData from '../data/rings.json'; // Adjust the path as necessary

// Mocking localStorage
beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            clear: jest.fn(),
        },
        writable: true,
    });
});

describe('Admin Component with Local Storage', () => {
    beforeEach(() => {
        // Mock initial local storage data
        window.localStorage.getItem.mockImplementation((key) => {
            if (key === 'rings') {
                return JSON.stringify(ringsData); // Use the JSON data
            }
            return null;
        });

        render(<Admin />);
    });

    test('renders without crashing', () => {
        expect(screen.getByText(/RINGS/i)).toBeInTheDocument();
    });

    test('adds a new ring', () => {
        const addRingButton = screen.getByText(/Add Ring/i);
        fireEvent.click(addRingButton);

        expect(screen.getByText(/Ring 2/i)).toBeInTheDocument(); // Expect Ring 2 to be added
    });

    test('deletes a ring', () => {
        const addRingButton = screen.getByText(/Add Ring/i);
        fireEvent.click(addRingButton); // Add a ring
        const deleteButton = screen.getByText(/Delete/i);
        fireEvent.click(deleteButton);

        expect(screen.queryByText(/Ring 1/i)).not.toBeInTheDocument(); // Ensure ring is deleted
    });

    test('adds a match and a competitor', () => {
        const addRingButton = screen.getByText(/Add Ring/i);
        fireEvent.click(addRingButton); // Add a ring

        const addMatchButton = screen.getByText(/Add Match/i);
        fireEvent.click(addMatchButton); // Add a match

        const competitorInput = screen.getByPlaceholderText(/Competitor Name/i);
        fireEvent.change(competitorInput, { target: { value: 'Competitor A' } });
        fireEvent.keyDown(competitorInput, { key: 'Enter' });

        expect(screen.getByText(/Competitor A/i)).toBeInTheDocument(); // Check if competitor is added
    });

    test('updates competitor score', () => {
        const addRingButton = screen.getByText(/Add Ring/i);
        fireEvent.click(addRingButton); // Add a ring

        const addMatchButton = screen.getByText(/Add Match/i);
        fireEvent.click(addMatchButton); // Add a match

        const competitorInput = screen.getByPlaceholderText(/Competitor Name/i);
        fireEvent.change(competitorInput, { target: { value: 'Competitor A' } });
        fireEvent.keyDown(competitorInput, { key: 'Enter' });

        const scoreInput = screen.getByDisplayValue(''); // Score input is initially empty
        fireEvent.change(scoreInput, { target: { value: '10' } });

        expect(scoreInput.value).toBe('10'); // Check if score is updated
    });

    afterAll(() => {
        jest.restoreAllMocks(); // Restore the original localStorage after tests
    });
});
