import { AssertionError } from './assertions.js';

// Custom fixture function
export function customFixture<T extends HTMLElement>(tagName: string, attributes: Record<string, string> = {}): T {
    const element = document.createElement(tagName) as T;
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }
    document.body.appendChild(element);
    return element;
}

// Custom expect function (simplified for now)
export function customExpect(value: any) {
    return {
        toExist: () => {
            if (value === null || value === undefined) {
                throw new AssertionError(`Expected ${value} to exist`);
            }
        },
        toEqual: (expected: any) => {
            if (value !== expected) {
                throw new AssertionError(`Expected ${value} to equal ${expected}`);
            }
        },
        toBeTrue: () => {
            if (value !== true) {
                throw new AssertionError(`Expected ${value} to be true`);
            }
        },
        toBeFalse: () => {
            if (value !== false) {
                throw new AssertionError(`Expected ${value} to be false`);
            }
        },
        toBeEmpty: () => {
            if (value !== '') {
                throw new AssertionError(`Expected ${value} to be empty`);
            }
        },
        toNotBeEmpty: () => {
            if (value === '') {
                throw new AssertionError(`Expected ${value} to not be empty`);
            }
        },
        // Add more assertions as needed
    };
}