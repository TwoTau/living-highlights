import { html } from 'lit';
import { ArticleElement } from '@living-papers/components';
import { generateFragment } from './fragment-generation-utils';

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
        let selectedText = getSafeRanges(selection.getRangeAt(0));
        const intentUrl = createTweetIntentUrl(selectedText, selection, window.location.href);

        function makeTweet() {
            // debounce
            const now = new Date().getTime();
            if (now - lastOpenedTweet > 200) {
                lastOpenedTweet = now;
                window.open(intentUrl, "_blank");
            }
        }

        this.querySelector('.anno-tray').appendChild(createThread());
        for (let i = 0; i < selectedText.length; i++) {
            let span = document.createElement("span");
            span.classList.add("annotation-highlight");
            selectedText[i].surroundContents(span);

            span.addEventListener('click', makeTweet);
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

    text = `"${text}"`;

    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

function createThread() {
    let threadCont = document.createElement("div");
    let annoThread = document.createElement("div");

    threadCont.classList.add('thread-cont');
    annoThread.classList.add('anno-thread');

    annoThread.textContent = window.getSelection().toString();
    threadCont.appendChild(annoThread);

    return threadCont;
}

//
//
// from https://stackoverflow.com/questions/304837/javascript-user-selection-highlighting, user:1725576
//
//
function getSafeRanges(dangerous) {
    var a = dangerous.commonAncestorContainer;
    // Starts -- Work inward from the start, selecting the largest safe range
    var s = new Array(0), rs = new Array(0);
    if (dangerous.startContainer != a)
        for(var i = dangerous.startContainer; i != a; i = i.parentNode)
            s.push(i)
    ;
    if (0 < s.length) for(var i = 0; i < s.length; i++) {
        var xs = document.createRange();
        if (i) {
            xs.setStartAfter(s[i-1]);
            xs.setEndAfter(s[i].lastChild);
        }
        else {
            xs.setStart(s[i], dangerous.startOffset);
            xs.setEndAfter(
                (s[i].nodeType == Node.TEXT_NODE)
                ? s[i] : s[i].lastChild
            );
        }
        rs.push(xs);
    }

    // Ends -- basically the same code reversed
    var e = new Array(0), re = new Array(0);
    if (dangerous.endContainer != a)
        for(var i = dangerous.endContainer; i != a; i = i.parentNode)
            e.push(i)
    ;
    if (0 < e.length) for(var i = 0; i < e.length; i++) {
        var xe = document.createRange();
        if (i) {
            xe.setStartBefore(e[i].firstChild);
            xe.setEndBefore(e[i-1]);
        }
        else {
            xe.setStartBefore(
                (e[i].nodeType == Node.TEXT_NODE)
                ? e[i] : e[i].firstChild
            );
            xe.setEnd(e[i], dangerous.endOffset);
        }
        re.unshift(xe);
    }

    // Middle -- the uncaptured middle
    if ((0 < s.length) && (0 < e.length)) {
        var xm = document.createRange();
        xm.setStartAfter(s[s.length - 1]);
        xm.setEndBefore(e[e.length - 1]);
    }
    else {
        return [dangerous];
    }

    // Concat
    rs.push(xm);
    return rs.concat(re);
}
