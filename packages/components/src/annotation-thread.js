import { html } from 'lit';
import { ArticleElement } from './article-element.js';

export class AnnotationThread extends ArticleElement {
    constructor() {
        super();
        document.addEventListener('keydown', this.keyDown);
    }

    keyDown(event) {
        if (event.key == 'h' && window.getSelection().toString()) {
            let annoTray = this.querySelector('.anno-tray');
            annoTray.appendChild(createThread());
            let selectedText = getSafeRanges(window.getSelection().getRangeAt(0));
            for (let i = 0; i < selectedText.length; i++) {
                let span = document.createElement("span");
                span.style.backgroundColor = "yellow";
                selectedText[i].surroundContents(span);
            }
        } 
    }

    openTab(){
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
            <div class='anno-button' @click=${this.openTab}></div>
        </div>`
    }
}

function createThread() {
    let threadCont = document.createElement("div");
    let annoThread = document.createElement("div");
    let counter = document.createElement("p");

    threadCont.classList.add('thread-cont');
    counter.classList.add('counter');
    annoThread.classList.add('anno-thread');

    threadCont.addEventListener('mousedown', (e, t) => expand(e, threadCont))
    annoThread.addEventListener('mousedown', (e, t) => appendReply(e, threadCont));

    counter.textContent = '0 replies';
    annoThread.textContent = window.getSelection().toString();
    threadCont.appendChild(annoThread);
    threadCont.appendChild(counter);

    return threadCont;
}

function appendReply(event, t) {
    let repl = document.createElement("div");
    repl.classList.add('reply');
    repl.textContent = '...';
    let replCont = document.createElement("div");
    replCont.classList.add('reply-cont');
    replCont.appendChild(repl);
    repl.addEventListener('mousedown', (e, t) => appendReply(e, replCont));
    t.appendChild(replCont);
    if (event.target.className != 'anno-thread') {
        event.stopImmediatePropagation();
    }
}

function expand(event, t) {
    if (!t.open) {
        t.open = true;
        t.style.height = '1000px';
        t.style.overflow = 'auto';
    } else {
        t.open = false;
        t.style.height = '150px';
        t.style.overflow = 'hidden';
    }
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
