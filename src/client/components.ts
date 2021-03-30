// @ts-ignore | stupid tc
import type Node from '../parser/Lexer.ts';
// @ts-ignore | stupid tc
import CodeMirror from '/node_modules/codemirror/src/codemirror.js';
// @ts-ignore | stupid tc
import {hintAnyword, closeHint, showHint, hintFromList, hintAuto} from './codemirror-addons.js';


CodeMirror.registerHelper("hint", "anyword", hintAnyword);
CodeMirror.defineExtension("showHint", showHint);
CodeMirror.defineExtension("closeHint", closeHint);
CodeMirror.registerHelper("hint", "fromList", hintFromList);
CodeMirror.registerHelper("hint", "auto", hintAuto);
CodeMirror.defineOption("hintOptions", null);

CodeMirror.commands.autocomplete = CodeMirror.showHint; //?

customElements.define('ast-program', class extends HTMLElement {
    constructor () {
        super();

        this.handleOnOver = this.handleOnOver.bind(this);
        this.handleOnOut = this.handleOnOut.bind(this);

        this.attachShadow({mode: 'open'});
        this.shadowRoot!.innerHTML = `
            <style>
                ul {list-style: none; margin: 0;}
                li {
                    padding-left: 1rem;
                }
                li:first-of-type,
                li:last-of-type {
                    padding-left: 0;
                }
            </style>
            <ul>
                <li>{</li>
                <li>name: PROGRAM,</li>
                <li data-start>
                    start: [<span></span>, <span></span>],
                </li>
                <li data-end>
                    end: [<span></span>, <span></span>],
                </li>
                <li>
                    errors: [<slot name="errors"></slot>],
                </li>
                <li>
                    statements: [<slot name="statements"></slot>]
                </li>
                <li>}</li>
            </ul>
        `;
    }

    connectedCallback() {
        !this.hasAttribute('start-line') && this.setAttribute('start-line', '0');
        !this.hasAttribute('end-line') && this.setAttribute('end-line', '0');
        !this.hasAttribute('start-column') && this.setAttribute('start-column', '0');
        !this.hasAttribute('end-column') && this.setAttribute('end-column', '0');

        this.addEventListener('mouseover', this.handleOnOver);
        this.addEventListener('mouseout', this.handleOnOut);
    }

    private handleOnOver() {
        this.dispatchEvent(new CustomEvent("over", {
            composed: true,
            detail: [
                { line: Number(this.getAttribute('start-line')), ch: Number(this.getAttribute('start-column')) },
                { line: Number(this.getAttribute('end-line')), ch: Number(this.getAttribute('end-column')) },
            ]
        }));
    }

    private handleOnOut() {
        this.dispatchEvent(new CustomEvent("out", {
            composed: true,
            detail: null
        }));
    }

    static get observedAttributes() {
        return ['start-line', 'end-line', 'start-column', 'end-column'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'start-line':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'end-line':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'start-column':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'end-column':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
        }
    }
});

customElements.define('ast-error', class extends HTMLElement {
    constructor () {
        super();

        this.handleOnOver = this.handleOnOver.bind(this);
        this.handleOnOut = this.handleOnOut.bind(this);

        this.attachShadow({mode: 'open'});
        this.shadowRoot!.innerHTML = `
            <style>
                ul {list-style: none; margin: 0;}
                li {
                    padding-left: 1rem;
                }
                li:first-of-type,
                li:last-of-type{
                    padding-left: 0;
                }
            </style>
            <ul>
                <li>{</li>
                <li data-start>
                    start: [<span></span>, <span></span>],
                </li>
                <li data-end>
                    end: [<span></span>, <span></span>],
                </li>
                <li data-message>
                    message: "<span></span>"
                </li>
                <li>}</li>
            </ul>
        `;
    }

    connectedCallback() {
        !this.hasAttribute('start-line') && this.setAttribute('start-line', '0');
        !this.hasAttribute('end-line') && this.setAttribute('end-line', '0');
        !this.hasAttribute('start-column') && this.setAttribute('start-column', '0');
        !this.hasAttribute('end-column') && this.setAttribute('end-column', '0');

        this.addEventListener('mouseover', this.handleOnOver);
        this.addEventListener('mouseout', this.handleOnOut);
    }

    private handleOnOver() {
        this.dispatchEvent(new CustomEvent("over", {
            composed: true,
            detail: [
                { line: Number(this.getAttribute('start-line')), ch: Number(this.getAttribute('start-column')) },
                { line: Number(this.getAttribute('end-line')), ch: Number(this.getAttribute('end-column')) },
            ]
        }));
    }

    private handleOnOut() {
        this.dispatchEvent(new CustomEvent("out", {
            composed: true,
            detail: null
        }));
    }

    static get observedAttributes() {
        return ['start-line', 'end-line', 'start-column', 'end-column', 'message'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'start-line':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'end-line':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'start-column':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'end-column':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'message':
                this.shadowRoot!.querySelector('[data-message]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
        }
    }
});

customElements.define('ast-location', class extends HTMLElement {
    constructor () {
        super();

        this.handleOnOver = this.handleOnOver.bind(this);
        this.handleOnOut = this.handleOnOut.bind(this);

        this.attachShadow({mode: 'open'});
        this.shadowRoot!.innerHTML = `
            <style>
                ul {list-style: none; margin: 0;}
                li {
                    padding-left: 1rem;
                }
                li:first-of-type,
                li:last-of-type{
                    padding-left: 0;
                }
            </style>
            <ul>
                <li>{</li>
                <li>name: LOCATION,</li>
                <li data-start>
                    start: [<span></span>, <span></span>],
                </li>
                <li data-end>
                    end: [<span></span>, <span></span>],
                </li>
                <li data-data>
                    data:
                    <span></span>
                    (<span></span>),
                </li>
                <li data-modifier>
                    modifier:
                    <span></span>
                    <span></span>,
                </li>
                <li>
                    errors: [<slot name="errors"></slot>]
                </li>
                <li>}</li>
            </ul>
        `;
    }

    connectedCallback() {
        !this.hasAttribute('start-line') && this.setAttribute('start-line', '0');
        !this.hasAttribute('end-line') && this.setAttribute('end-line', '0');
        !this.hasAttribute('start-column') && this.setAttribute('start-column', '0');
        !this.hasAttribute('end-column') && this.setAttribute('end-column', '0');
        !this.hasAttribute('data') && this.setAttribute('data', '0');
        // !this.hasAttribute('modifier') && this.setAttribute('modifier', '0');
        // !this.hasAttribute('modification') && this.setAttribute('modification', '0');

        this.addEventListener('mouseover', this.handleOnOver);
        this.addEventListener('mouseout', this.handleOnOut);
    }

    private handleOnOver() {
        this.dispatchEvent(new CustomEvent("over", {
            composed: true,
            detail: [
                { line: Number(this.getAttribute('start-line')), ch: Number(this.getAttribute('start-column')) },
                { line: Number(this.getAttribute('end-line')), ch: Number(this.getAttribute('end-column')) },
            ]
        }));
    }

    private handleOnOut() {
        this.dispatchEvent(new CustomEvent("out", {
            composed: true,
            detail: null
        }));
    }

    static get observedAttributes() {
        return ['start-line', 'end-line', 'start-column', 'end-column', 'raw-data', 'data', 'modifier', 'modification'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'start-line':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'end-line':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'start-column':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'end-column':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'data':
                this.shadowRoot!.querySelector('[data-data]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'raw-data':
                this.shadowRoot!.querySelector('[data-data]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'modifier':
                this.shadowRoot!.querySelector('[data-modifier]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'modification':
                this.shadowRoot!.querySelector('[data-modifier]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
        }
    }
});

customElements.define('ast-assignment', class extends HTMLElement {
    constructor () {
        super();

        this.handleOnOver = this.handleOnOver.bind(this);
        this.handleOnOut = this.handleOnOut.bind(this);

        this.attachShadow({mode: 'open'});
        this.shadowRoot!.innerHTML = `
            <style>
                ul {list-style: none; margin: 0;}
                li {
                    padding-left: 1rem;
                }
                li:first-of-type,
                li:last-of-type{
                    padding-left: 0;
                }
            </style>
            <ul>
                <li>{</li>
                <li>name: ASSIGNMENT,</li>
                <li data-start>
                    start: [<span></span>, <span></span>],
                </li>
                <li data-end>
                    end: [<span></span>, <span></span>],
                </li>
                <li data-label>
                    label: "<span></span>",
                </li>
                <li data-data>
                    data:
                    <span></span>
                    (<span></span>),
                </li>
                <li>
                    errors: [<slot name="errors"></slot>]
                </li>
                <li>}</li>
            </ul>
        `;
    }

    connectedCallback() {
        !this.hasAttribute('start-line') && this.setAttribute('start-line', '0');
        !this.hasAttribute('end-line') && this.setAttribute('end-line', '0');
        !this.hasAttribute('start-column') && this.setAttribute('start-column', '0');
        !this.hasAttribute('end-column') && this.setAttribute('end-column', '0');

        this.addEventListener('mouseover', this.handleOnOver);
        this.addEventListener('mouseout', this.handleOnOut);
    }

    private handleOnOver() {
        this.dispatchEvent(new CustomEvent("over", {
            composed: true,
            detail: [
                { line: Number(this.getAttribute('start-line')), ch: Number(this.getAttribute('start-column')) },
                { line: Number(this.getAttribute('end-line')), ch: Number(this.getAttribute('end-column')) },
            ]
        }));
    }

    private handleOnOut() {
        this.dispatchEvent(new CustomEvent("out", {
            composed: true,
            detail: null
        }));
    }

    static get observedAttributes() {
        return ['start-line', 'end-line', 'start-column', 'end-column', 'label', 'data', 'raw-data'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'start-line':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'end-line':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'start-column':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'end-column':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'label':
                this.shadowRoot!.querySelector('[data-label]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'data':
                this.shadowRoot!.querySelector('[data-data]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'raw-data':
                this.shadowRoot!.querySelector('[data-data]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
        }
    }
});

customElements.define('ast-definition', class extends HTMLElement {
    constructor() {
        super();

        this.handleOnOver = this.handleOnOver.bind(this);
        this.handleOnOut = this.handleOnOut.bind(this);

        this.attachShadow({ mode: 'open' });
        this.shadowRoot!.innerHTML = `
            <style>
                ul {list-style: none; margin: 0;}
                li {
                    padding-left: 1rem;
                }
                li:first-of-type,
                li:last-of-type{
                    padding-left: 0;
                }
            </style>
            <ul>
                <li>{</li>
                <li>name: DEFINITION,</li>
                <li data-start>
                    start: [<span></span>, <span></span>],
                </li>
                <li data-end>
                    end: [<span></span>, <span></span>],
                </li>
                <li data-label>
                    label: "<span></span>",
                </li>
                <li data-type>
                    type: <span></span>,
                </li>
                <li>
                    errors: [<slot name="errors"></slot>]
                </li>
            </ul>
        `;
    }

    connectedCallback() {
        !this.hasAttribute('start-line') && this.setAttribute('start-line', '0');
        !this.hasAttribute('end-line') && this.setAttribute('end-line', '0');
        !this.hasAttribute('start-column') && this.setAttribute('start-column', '0');
        !this.hasAttribute('end-column') && this.setAttribute('end-column', '0');
        // !this.hasAttribute('type') && this.setAttribute('type', '0');

        this.addEventListener('mouseover', this.handleOnOver);
        this.addEventListener('mouseout', this.handleOnOut);
    }

    private handleOnOver() {
        this.dispatchEvent(new CustomEvent("over", {
            composed: true,
            detail: [
                { line: Number(this.getAttribute('start-line')), ch: Number(this.getAttribute('start-column')) },
                { line: Number(this.getAttribute('end-line')), ch: Number(this.getAttribute('end-column')) },
            ]
        }));
    }

    private handleOnOut() {
        this.dispatchEvent(new CustomEvent("out", {
            composed: true,
            detail: null
        }));
    }

    static get observedAttributes() {
        return ['start-line', 'end-line', 'start-column', 'end-column', 'type', 'label'];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        switch (name) {
            case 'start-line':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'end-line':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'start-column':
                this.shadowRoot!.querySelector('[data-start]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'end-column':
                this.shadowRoot!.querySelector('[data-end]')!
                    .querySelectorAll('span')
                    .item(1)
                    .innerText = newValue;
                break;
            case 'type':
                this.shadowRoot!.querySelector('[data-type]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
            case 'label':
                this.shadowRoot!.querySelector('[data-label]')!
                    .querySelectorAll('span')
                    .item(0)
                    .innerText = newValue;
                break;
        }
    }
});

customElements.define('ast-app', class extends HTMLElement {
    private outputElement: HTMLElement | null = null;
    private inputElement: HTMLElement | null = null;
    private markers: any[] = [];
    private editor: CodeMirror;

    constructor() {
        super();

        this.handleOnWorkerMessage = this.handleOnWorkerMessage.bind(this);

        this.attachShadow({mode: 'open'});
        this.shadowRoot!.innerHTML = `
            <style>
                :host {
                    display: grid;
                    height: 100%;

                    grid-template-areas:
                        'header header'
                        'main aside'
                        'footer footer';

                    grid-template-columns: 1fr 1fr;
                    grid-template-rows: auto 1fr auto;
                }
                header {
                    grid-area: header;
                }
                main {
                    grid-area: main;
                }
                aside {
                    grid-area: aside;
                }
                footer {
                    grid-area: footer;
                }
            </style>
            <link rel="stylesheet" href="/lib/codemirror.css">
            <header>
                actions
            </header>
            <main>
                <textarea style="display:inherit; width:inherit; height:inherit;"></textarea>
            </main>
            <aside data-output></aside>
            <footer>
                console and memory
            </footer>
        `;
    }

    async connectedCallback() {

        var myWorker = new Worker('/dist/client/worker.js', { type: "module" });
        myWorker.onmessage = this.handleOnWorkerMessage;

        this.outputElement = this.shadowRoot!.querySelector('[data-output]');
        this.inputElement = this.shadowRoot!.querySelector('textarea');

        CodeMirror.commands.autocomplete = function (cm: CodeMirror) {
            cm.showHint({ hint: CodeMirror.hint.anyword });
        }

        this.editor = CodeMirror.fromTextArea(this.inputElement, {
            lineNumbers: true,
            readOnly: false,
            indentUnit: 4,
            tabSize: 4,
            mode: 'null',
            theme: 'default',
            viewportMargin: CodeMirror.defaults.viewportMargin,
            extraKeys: { "Ctrl-Space": "autocomplete" },
        });

        await new Promise(resolve => setTimeout(resolve, 50))
        // this.editor.swapDoc(CodeMirror.Doc('*=$8000', this.getAttribute('mode')))
        this.editor.refresh()

        this.addEventListener('over', ((event: CustomEvent<any[]>) => {
            event.stopPropagation();
            this.markers.push(this.editor.markText(
                event.detail[0],
                event.detail[1],
                { css: 'color: red' }
            ));
        }) as EventListener);
        this.addEventListener('out', ((event: CustomEvent<null>) => {
            event.stopPropagation();
            this.markers.forEach(item => item.clear());
            this.markers = [];
        }) as EventListener);

        this.editor.on('change', (cm: CodeMirror) => {
            myWorker.postMessage(cm.getValue());
        });

    }

    private handleOnWorkerMessage(event: MessageEvent) {
        const tree = event.data;
        const astRoot = this.programElement(tree);

        this.outputElement!.innerText = '';
        this.outputElement!.appendChild(astRoot);
    }

    private errorElement(error: any): HTMLElement {
        const errorElement = document.createElement('ast-error');

        errorElement.setAttribute('start-line', error.token?.line);
        errorElement.setAttribute('start-column', error.token?.from);

        errorElement.setAttribute('end-line', error.token?.line);
        errorElement.setAttribute('end-column', error.token?.to);

        errorElement.setAttribute('message', error.message);
        errorElement.setAttribute('slot', 'errors')
        return errorElement;
    }

    private assignmentElement(item: any) {
        const assignmentElement = document.createElement('ast-assignment');
        assignmentElement.setAttribute('start-line', item.start[0]);
        assignmentElement.setAttribute('end-line', item.end[0]);

        assignmentElement.setAttribute('start-column', item.start[1]);
        assignmentElement.setAttribute('end-column', item.end[1]);

        assignmentElement.setAttribute('label', item.label);
        item.data && assignmentElement.setAttribute('data', item.data);
        item.rawData && assignmentElement.setAttribute('raw-data', item.rawData);

        !!item.error.length && (
            item.error.map(this.errorElement)
                .forEach((e: HTMLElement) => assignmentElement.appendChild(e))
        );

        return assignmentElement;
    }

    private locationElement(item: any) {
        const locationElement = document.createElement('ast-location');
        locationElement.setAttribute('start-line', item.start[0]);
        locationElement.setAttribute('end-line', item.end[0]);

        locationElement.setAttribute('start-column', item.start[1]);
        locationElement.setAttribute('end-column', item.end[1]);

        item.data && locationElement.setAttribute('data', item.data);
        item.rawData && locationElement.setAttribute('raw-data', item.rawData);

        item.modifier && locationElement.setAttribute('modifier', item.modifier);
        item.modification && locationElement.setAttribute('modification', item.modification);

        !!item.error.length && (
            item.error.map(this.errorElement)
                .forEach((e: HTMLElement) => locationElement.appendChild(e))
        );
        return locationElement;
    }

    private definitionElement(item: any) {
        const definitionElement = document.createElement('ast-definition');
        definitionElement.setAttribute('start-line', item.start[0]);
        definitionElement.setAttribute('end-line', item.end[0]);

        definitionElement.setAttribute('start-column', item.start[1]);
        definitionElement.setAttribute('end-column', item.end[1]);

        definitionElement.setAttribute('type', item.type);
        definitionElement.setAttribute('label', item.label);

        !!item.error.length && (
            item.error.map(this.errorElement)
                .forEach((e: HTMLElement) => definitionElement.appendChild(e))
        );
        return definitionElement;
    }

    private programElement(tree: any) {
        const astRoot = document.createElement('ast-program');
        astRoot.setAttribute('start-line', tree.start[0]);
        astRoot.setAttribute('end-line', tree.end[0]);

        astRoot.setAttribute('start-column', tree.start[1]);
        astRoot.setAttribute('end-column', tree.end[1]);

        tree.statements.forEach((item: Node) => {
            switch (item.name) {
                case 'Assignment': {
                    const node = this.assignmentElement(item);
                    node.slot = 'statements';
                    astRoot.appendChild(node);
                } break;
                case 'Location': {
                    const node = this.locationElement(item);
                    node.slot = 'statements';
                    astRoot.appendChild(node);
                } break;
                case 'Definition': {
                    const node = this.definitionElement(item);
                    node.slot = 'statements';
                    astRoot.appendChild(node);
                } break;
            }
        });

        return astRoot;
    }
});


function throttle(func: Function, limit: number): Function {
    let inThrottle: boolean;

    return function (this: any): any {
        const args = arguments;
        const context = this;

        if (!inThrottle) {
            inThrottle = true;
            func.apply(context, args);
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
