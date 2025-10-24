describe('TestComponent', () => {
    it('should render with default message', async () => {
        const element = document.createElement('test-component');
        document.body.appendChild(element);
        await element.updateComplete;
        expect(element.shadowRoot?.querySelector('p')?.textContent).toBe('Hello, Cortex!');
        document.body.removeChild(element);
    });
    it('should render with a custom message', async () => {
        const element = document.createElement('test-component');
        element.message = 'Custom Message';
        document.body.appendChild(element);
        await element.updateComplete;
        expect(element.shadowRoot?.querySelector('p')?.textContent).toBe('Custom Message');
        document.body.removeChild(element);
    });
});
export {};
