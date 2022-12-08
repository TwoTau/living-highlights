import { html, render } from 'lit';
import { ArticleElement } from '@living-papers/components';
import { generateFragment } from './fragment-generation-utils';
import { markRange, getAllTextNodes, removeMarks } from './text-fragment-utils';
import { ColorPickerControl } from './color-picker';

// used for click debouncing
let lastOpenedTweet = 0;

export default class AnnotationThread extends ArticleElement {
    constructor() {
        super();
        document.addEventListener('mouseup', this.mouseUp);
    }

    mouseUp() {
        const selection = window.getSelection();
        if (!selection.toString()) return;
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        document.querySelector('annotation-thread').createTooltip(document.body.querySelector('article'),
                 rect.x + rect.width / 2.0 + window.scrollX - 30, rect.y - 40 + window.scrollY, selection);
    }

    createTooltip(parent, x, y, selection) {
        const tooltip = document.createElement('div');
        tooltip.classList.add('anno-tooltip');
        tooltip.style.top = `${y}px`;
        tooltip.style.left = `${x}px`;
        let tooltipContents = html`<div class="tooltip-tweet"><div class='icon-tweet'></div></div>
                <div class="tooltip-highlight"><div class='icon-highlight'></div></div>`;
        parent.insertBefore(tooltip, parent.firstChild)
        render(tooltipContents, tooltip);
        document.addEventListener('selectionchange', () => {tooltip.style.display = 'none';});
        const thread = document.querySelector('annotation-thread');
        tooltip.querySelector('.tooltip-tweet').addEventListener('mousedown', () => {thread.highlight(selection, tooltip, true)});
        tooltip.querySelector('.tooltip-highlight').addEventListener('mousedown', () => {thread.highlight(selection, tooltip)});
        tooltip.querySelector('.tooltip-highlight').removeEventListener('mousedown', () => {thread.highlight(selection, tooltip)});
        tooltip.querySelector('.tooltip-tweet').removeEventListener('mousedown', () => {thread.highlight(selection, tooltip, true)});
    }

    highlight(selection, tooltip, tweet=false) {
        let range = selection.getRangeAt(0);

        let selectedText = extractTextContent(range);
        const intentUrl = createTweetIntentUrl(selectedText, selection, window.location.href);
        let marks = markRange(range, document);

        if (marks.length === 0) return;

        let thread = createThread(this.querySelector('.anno-threads'), 'Username', selectedText,
            new Date().toString(), 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
            (tweet ? 'Tweet' : 'Highlight')
        );

        let hl = tooltip.querySelector('.tooltip-highlight');
        tooltip.querySelector('.tooltip-tweet').addEventListener('mousedown', () => {makeTweet()});
        if (hl) {
            hl.className = 'tooltip-remove';
            hl.textContent = 'X';
            hl.addEventListener('mousedown', () => {
                thread.remove();
                tooltip.remove();
                removeMarks(marks);
            });
        }

        marks.forEach(m => {addMarkEvents(m)});

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
                tooltip.style.display = 'flex';
                marks.forEach(m => {
                    m.classList.add('hovered');
                });
            });
            mark.addEventListener('mouseout', async (e) => {
                marks.forEach(m => {
                    m.classList.remove('hovered');
                });
                if (marks.includes(e.target)) return;
                await new Promise(resolve => setTimeout(resolve, 500));
                tooltip.style.display = 'none';
            });
            mark.addEventListener('mousedown', makeTweet);
        }

        // clear selection
        selection.removeAllRanges();
        if (tweet) makeTweet();
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

    openColor() {
        let annotation = this.querySelector('.anno-color');
        let a = this.querySelector('.anno-button');
        let b = this.querySelector('.anno-color-button');
        let c = this.querySelector('.anno-side-tray');
        if (!annotation.open) {
            annotation.open = true;
            a.style.transform = 'translate(0, 118px)';
            b.style.transform = 'translate(0, 118px)';
            c.style.height = `430px`;
            c.style.width = `180px`;
            b.textContent = '-';
        } else {
            annotation.open = false;
            c.style.width = `30px`;
            a.style.transform = 'translate(0, 0)';
            b.style.transform = 'translate(0, 0)';
            c.style.height = `300px`;
            b.textContent = '+';
        }
    }

    firstUpdated() {
        this.colorPicker = new ColorPickerControl({ container: this.querySelector('.anno-color'), theme:'light'});
        this.colorPicker.on('change', (color) => {
            document.querySelector('article').style.setProperty('--highlight-color',
                `hsla(${color.h},${color.s}%,${color.v}%, ${color.a})`);
            this.requestUpdate();
        });
        this.requestUpdate();
    }

    render() {
        return html`<div class='anno'>
            <div class='anno-tray'>
                <div class="top-nav">
                    <div class="title"><h2 style="margin: 0;">Discussions<h3></div>
                </div>
                <div class="anno-threads"></div>
            </div>
            <div class="anno-side-tray">
                <div class='anno-color'></div>
                <div class="anno-color-button" @click=${this.openColor}>+</div>
                <div class='anno-button' @click=${this.openTab}>
                    <p style="transform: rotate(90deg) translate(-5px, -2px);margin: 0;">tweets</p>
                </div>
            </div>
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

function createThread (parent, username, threadText, threadDate, threadComment=null, threadType='Highlight') {
    const thread = document.createElement('div');
    thread.classList.add('thread');
    let threadContents = html`
                    <div class="thread-info">
                        <div class="thread-username">${username}</div>
                        <div class="thread-type">${threadType}</div>
                    </div>
                    <div class="thread-body">
                        <div class="thread-text">${threadText}</div>
                        <div class="thread-comment">${threadComment}</div>
                    </div>
                    <div class="thread-datetime">${threadDate}</div>`;
    parent.insertBefore(thread, parent.firstChild)
    render(threadContents, thread);
    return thread;
}

function createTweetIntentUrl(text, selection, url) {
    text = `"${text}"`;
    let intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

    try {
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

        intent += `&url=${encodeURIComponent(url)}`;
    } catch (e) {
        console.error('Error generating fragment', e);
    }
    
    return intent;
}
