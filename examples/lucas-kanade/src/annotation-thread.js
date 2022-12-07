import { html } from 'lit';
import { ArticleElement } from '@living-papers/components';
import { generateFragment } from './fragment-generation-utils';
import { markRange, getAllTextNodes } from './text-fragment-utils';

// used for click debouncing
let lastOpenedTweet = 0;

export default class AnnotationThread extends ArticleElement {
    constructor() {
        super();
        document.addEventListener('keydown', this.keyDown);
    }

    keyDown(event) {
        const selection = window.getSelection();
        if (event.key !== 'h' && event.key !== 't' || !selection.toString()) {
            return;
        }
        event.stopPropagation();
        let range = selection.getRangeAt(0);

        let selectedText = extractTextContent(range);
        const intentUrl = createTweetIntentUrl(selectedText, selection, window.location.href);
        let marks = markRange(range, document);

        if (marks.length === 0) return;

        marks.forEach(m => {addMarkEvents(m)});
        this.querySelector('.anno-tray').appendChild(createThread(selectedText));

        function makeTweet() {
            // debounce
            const now = new Date().getTime();
            if (now - lastOpenedTweet > 200) {
                lastOpenedTweet = now;
                window.open(intentUrl, "_blank");
            }
        }

        function addMarkEvents(mark) {
            mark.addEventListener('mouseover', () => {
                marks.forEach(m => {
                    m.classList.add('hovered');
                });
            });
            mark.addEventListener('mouseout', () => {
                marks.forEach(m => {
                    m.classList.remove('hovered');
                });
            });
            mark.addEventListener('mousedown', makeTweet);
        }

        // clear selection
        selection.removeAllRanges();

        if (event.key === 't') {
            makeTweet();
        }
    }

    openTab() {
        let annotation = this.querySelector('.anno');
        if (!annotation.open) {
            annotation.open = true;
            annotation.style.transform = 'translate(-420px, 0)';
        } else {
            annotation.open = false;
            annotation.style.transform = 'translate(0, 0)';
        }
    }

    render() {
        return html`<div class='anno'>
            <div class='anno-tray'></div>
            <div class='anno-button' @click=${this.openTab}>tweets</div>
        </div>`
    }
}

function extractTextContent(range) {
    let textNodes = getAllTextNodes(range.commonAncestorContainer, range).flat(1);
    let text = textNodes.length !== 0 ? textNodes.map(m=>m.textContent).join('') : range.startContainer.textContent;

    let firstSpaceFound = text.lastIndexOf(' ', range.startOffset);
    let firstSpaceOffset = firstSpaceFound !== -1 ? firstSpaceFound: 0;

    let lastSpaceFound, lastSpaceOffset;
    if (textNodes.length === 0) {
        lastSpaceFound = text.slice(range.endOffset).indexOf(' ');
        lastSpaceOffset = range.endOffset + (lastSpaceFound !== -1 ? lastSpaceFound: 0);
    } else {
        let lenEndNode = textNodes[textNodes.length - 1].length;
        let endOffset = text.length - lenEndNode + range.endOffset;
        lastSpaceFound = text.slice(endOffset).indexOf(' ');
        lastSpaceOffset = endOffset + (lastSpaceFound !== -1 ? lastSpaceFound : lenEndNode);
    }
    return text.slice(firstSpaceOffset, lastSpaceOffset);
}

function createTweetIntentUrl(text, selection, url) {
    const result = generateFragment(selection);

    if (result.status === 0) {
        const fragment = result.fragment;
        const prefix = fragment.prefix ?
            `${encodeURIComponent(fragment.prefix)}-,` :
            '';
        const suffix = fragment.suffix ?
            `,-${encodeURIComponent(fragment.suffix)}` :
            '';
        const textStart = encodeURIComponent(fragment.textStart);
        const textEnd = fragment.textEnd ?
            `,${encodeURIComponent(fragment.textEnd)}` :
            '';

        url += '#:~:text=' + prefix + textStart + textEnd + suffix;
    }

    text = `"${text}"\n`;

    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

function createThread(text) {
    let threadCont = document.createElement("div");
    let annoThread = document.createElement("div");

    threadCont.classList.add('thread-cont');
    annoThread.classList.add('anno-thread');

    annoThread.textContent = text;
    threadCont.appendChild(annoThread);

    return threadCont;
}
