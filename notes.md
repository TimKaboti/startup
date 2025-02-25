# CS 260 Notes

[My startup](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS Notes



## HTML Notes



## REACT Notes
react hooks and what they do


Hook	        Purpose
useState	    Manage component state
useEffect	    Handle side effects (API calls, DOM changes)
useContext	    Use global state without prop drilling
useRef	        Access DOM elements or persist values without re-renders

useReducer	    Manage complex state logic like Redux
useMemo	        Optimize expensive computations
useCallback	    Optimize function references
useLayoutEffect	Runs synchronously after DOM updates


Use Case	                        Use This Hook
Component needs state	            useState
Side effects (fetching, timers)	    useEffect
Global state management	            useContext
Accessing a DOM element	            useRef
Memoizing expensive calculations	useMemo
Optimizing function references	    useCallback
Complex state logic	                useReducer
Reusing logic across components	    Create a custom hook
