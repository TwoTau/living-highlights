import { html, render } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ArticleElement } from '@living-papers/components';
import { generateFragment } from './fragment-generation-utils';
import { markRange, getAllTextNodes, removeMarks, parseFragmentDirectives, getFragmentDirectives, processTextFragmentDirective } from './text-fragment-utils';
import { ColorPickerControl } from './color-picker';
import { getTweets } from './api';

// used for click debouncing
let lastOpenedTweet = 0;

export default class AnnotationThread extends ArticleElement {
    constructor() {
        super();
        document.addEventListener('mouseup', this.mouseUp.bind(this));

        getTweets().then((tweets) => {
            console.table(tweets);

            for (const tweet of tweets) {
                const range = fragmentToRange(tweet.fragment);
                const selectedText = range ? extractTextContent(range) : 'Unknown';

                if (range) {
                    this.highlightRange(range, null, tweet.fragment);
                }

                createTweetThread({
                    parent: this.querySelector('.anno-threads'),
                    link: tweet.link,
                    username: tweet.name,
                    threadText: selectedText,
                    threadDate: new Date(tweet.time),
                    threadComment: tweet.text,
                });
            }
        });

        setTimeout(() => {
            this.openTab();
        }, 1000);
    }

    mouseUp() {
        const selection = window.getSelection();
        if (!selection.toString()) return;
        const tooltip = this.createOnlyTooltip(selection.getRangeAt(0));

        document.addEventListener('selectionchange', () => { tooltip.style.display = 'none'; });
        tooltip.querySelector('.tooltip-tweet').addEventListener('mousedown', () => {this.highlight(selection, tooltip, true)});
        tooltip.querySelector('.tooltip-highlight').addEventListener('mousedown', () => {this.highlight(selection, tooltip)});
        tooltip.querySelector('.tooltip-highlight').removeEventListener('mousedown', () => {this.highlight(selection, tooltip)});
        tooltip.querySelector('.tooltip-tweet').removeEventListener('mousedown', () => {this.highlight(selection, tooltip, true)});
    }

    createOnlyTooltip(range) {
        const rect = range.getBoundingClientRect();
        const parent = document.body.querySelector('article');
        const x = rect.x + rect.width / 2.0 + window.scrollX - 30;
        const y = rect.y - 40 + window.scrollY;

        const tooltip = document.createElement('div');
        tooltip.classList.add('anno-tooltip');
        tooltip.style.top = `${y}px`;
        tooltip.style.left = `${x}px`;
        let tooltipContents = html`<div class="tooltip-tweet"><div class='icon-tweet'></div></div>
                <div class="tooltip-highlight"><div class='icon-highlight'></div></div>`;
        parent.insertBefore(tooltip, parent.firstChild)
        render(tooltipContents, tooltip);

        return tooltip;
    }

    highlight(selection, tooltip, tweet = false) {
        let range = selection.getRangeAt(0);
        const selectedText = this.highlightRange(range, tooltip, selection, tweet);

        // clear selection
        selection.removeAllRanges();

        createHighlightThread({
            parent: this.querySelector('.anno-threads'),
            username: 'You',
            threadText: selectedText,
            threadDate: new Date(),
            threadComment: '',
        });
    }

    highlightRange(range, tooltip, selectionOrFragment, tweet = false) {
        console.log(range, selectionOrFragment);
        let selectedText = extractTextContent(range);
        const intentUrl = createTweetIntentUrl(selectedText, selectionOrFragment, window.location.href);
        let marks = markRange(range, document);

        marks.forEach(m => { addMarkEvents(m) });

        if (tooltip) {
            let hl = tooltip.querySelector('.tooltip-highlight');
            tooltip.querySelector('.tooltip-tweet').addEventListener('mousedown', () => {makeTweet()});
            if (hl) {
                hl.className = 'tooltip-remove';
                hl.textContent = 'X';
                hl.addEventListener('mousedown', () => {
                    const thread = null;
                    thread.remove?.();
                    tooltip.remove();
                    removeMarks(marks);
                });
            }

        }

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
                if (tooltip) {
                    tooltip.style.display = 'none';
                }
            });
            mark.addEventListener('mousedown', makeTweet);
        }

        if (tweet) makeTweet();

        return selectedText;
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
        this.colorPicker = new ColorPickerControl({ container: this.querySelector('.anno-color'), theme: 'light' });
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

// fragmentHash = "#:~:text=reader%20highlights%20and%20social%20annotations"
function fragmentToRange(fragmentHash) {
    const dir = getFragmentDirectives(fragmentHash);
    const frags = parseFragmentDirectives(dir);
    return processTextFragmentDirective(frags.text[0])[0];
}

function extractTextContent(range) {
    let textNodes = getAllTextNodes(range.commonAncestorContainer, range).flat(1);
    let text = textNodes.length !== 0 ? textNodes.map(m => m.textContent).join('') : range.startContainer.textContent;

    let firstSpaceFound = text.lastIndexOf(' ', range.startOffset);
    let firstSpaceOffset = firstSpaceFound !== -1 ? firstSpaceFound : 0;

    let lastSpaceFound, lastSpaceOffset;
    if (textNodes.length === 0) {
        lastSpaceFound = text.slice(range.endOffset).indexOf(' ');
        lastSpaceOffset = range.endOffset + (lastSpaceFound !== -1 ? lastSpaceFound : 0);
    } else {
        let lenEndNode = textNodes[textNodes.length - 1].length;
        let endOffset = text.length - lenEndNode + range.endOffset;
        lastSpaceFound = text.slice(endOffset).indexOf(' ');
        lastSpaceOffset = endOffset + (lastSpaceFound !== -1 ? lastSpaceFound : lenEndNode);
    }
    return text.slice(firstSpaceOffset, lastSpaceOffset);
}

function createTweetThread({
    parent,
    link,
    username,
    threadText,
    threadDate,
    threadComment = null,
}) {
    const thread = document.createElement('div');
    thread.classList.add('thread');
    thread.classList.add('type-tweet');
    let threadContents = html`
        <div class="thread-info">
            <div class="thread-username"><a href="${link}" target="_blank">${username}</a></div>
            <div class="thread-type">Tweet</div>
        </div>
        <div class="thread-body">
            <div class="thread-text">${threadText}</div>
            <div class="thread-comment">${unsafeHTML(linkifyText(threadComment))}</div>
        </div>
        <div class="thread-datetime">${threadDate.toLocaleString()}</div>`;
    parent.insertBefore(thread, parent.firstChild)
    render(threadContents, thread);
    return thread;
}

function createHighlightThread({
    parent,
    username,
    threadText,
    threadDate,
    threadComment = null,
}) {
    const thread = document.createElement('div');
    thread.classList.add('thread');
    thread.classList.add('type-highlight');
    let threadContents = html`
        <div class="thread-info">
            <div class="thread-username">${username}</div>
            <div class="thread-type">Highlight</div>
        </div>
        <div class="thread-body">
            <div class="thread-text">${threadText}</div>
            <div class="thread-comment">${threadComment}</div>
        </div>
        <div class="thread-datetime">${threadDate.toLocaleString()}</div>`;
    parent.insertBefore(thread, parent.firstChild)
    render(threadContents, thread);
    return thread;
}

// Taken from StackOverflow: https://stackoverflow.com/a/3890175/5038563
function linkifyText(inputText) {
    let replacedText, replacePattern1, replacePattern2, replacePattern3;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}

function createTweetIntentUrl(text, selectionOrFragment, url) {
    text = `"${text}"`;
    let intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

    try {
        if (typeof selectionOrFragment === 'string') { // fragment
            url += '#:~:text=' + selectionOrFragment;
        } else { // selection
            const result = generateFragment(selectionOrFragment);

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
        }

        intent += `&url=${encodeURIComponent(url)}`;
    } catch (e) {
        console.error('Error generating fragment', e);
    }

    return intent;
}
