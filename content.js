(function () {
    const observers = [];

    // replace all occurences on page and observe for changes
    replaceAllInstancesWithinNode(document.body);
    observeNode(document.body);

    // walk through child nodes until text elements are reached then replace occurrences
    function replaceAllInstancesWithinNode(rootNode) {
    
        // get all text nodes
        const ignoredTags = ['HEAD', 'SCRIPT', 'STYLE', 'TEMPLATE', 'TEXTAREA', 'INPUT'];
        const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_TEXT, {
            acceptNode: n => {
                if (n.parentElement && ignoredTags.includes(n.parentElement.tagName)) {
                    return NodeFilter.FILTER_REJECT;
                }
                if (!n.textContent?.trim()) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        let currentNode;
        while ((currentNode = walker.nextNode())) {
            const capturedNode = currentNode;
            queueMicrotask(() => {
                capturedNode.textContent = replaceText(capturedNode.textContent);
            });     
        }

        // titles can change and there's no way to detect it so we make sure it's on every change
        document.title = replaceText(document.title);
    }

    // observe changes to particular node and replace all occurrences
    function observeNode(rootNode) {
        const observerConfig = { childList: true, subtree: true, characterData: true };

        const observer = new MutationObserver(mutations => {
            // temporarily stop observing while text is updated so as not to trigger an infinite loop 
            observer.disconnect();
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData') {
                    mutation.target.textContent = replaceText(mutation.target.textContent);
                } 
                else if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(n => {                   
                        if (n.nodeType === Node.TEXT_NODE) {
                            n.textContent = replaceText(n.textContent);
                        }

                        // walk inside the added element for text nodes
                        else if (n.nodeType === Node.ELEMENT_NODE) {
                            replaceAllInstancesWithinNode(n);
                        }
                    });
                }
            });
            
            // titles can change any time and there's no way to detect it, so we make sure it's updated on every change for good measure
            document.title = replaceText(document.title);

            // restart observing after temporary pause
            observer.observe(rootNode, observerConfig);
        });

        // observe
        observer.observe(rootNode, observerConfig);
        observers.push(observer);
    }
    
    function replaceText(string) {
        return string
            .replace(/\bTesla\b/gi, 'Tesler')
            .replace(/\bTSLA\b/g, 'TSLR');
    } 
})();
