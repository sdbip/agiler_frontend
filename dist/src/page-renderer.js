var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Mustache from 'mustache';
import path from 'path';
import { promises as fs } from 'fs';
import { HTMLDocument } from 'happy-dom';
import { marked } from 'marked';
import { fileURLToPath } from 'url';
import * as env from './config.js';
export class PageRenderer {
    constructor(document) {
        this.document = document;
    }
    static mustache(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fs.readFile(resolve(`../${env.DIST_DIR}/pages/template.mustache.html`));
            const template = data.toString('utf-8')
                .replace('{{READ_MODEL_URL}}', env.READ_MODEL_URL)
                .replace('{{WRITE_MODEL_URL}}', env.WRITE_MODEL_URL);
            const html = Mustache.render(template, { page });
            return this.read(html);
        });
    }
    static read(html) {
        const document = new HTMLDocument();
        document.documentElement.outerHTML = html;
        return new PageRenderer(document);
    }
    inject(page) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield fs.readFile(resolve(`../${env.DIST_DIR}/pages/${page}.md`));
            const markdown = data.toString('utf-8');
            const html = marked.parse(markdown);
            this.document.body.innerHTML = html;
        });
    }
    render() {
        return `<!DOCTYPE html>${this.document.documentElement.outerHTML}`;
    }
}
export function render(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const renderer = yield PageRenderer.mustache(page);
        yield renderer.inject(page);
        return renderer.render();
    });
}
export function resolve(relPath) {
    const thisFile = fileURLToPath(import.meta.url);
    const thisDir = path.dirname(thisFile);
    return path.join(thisDir, relPath);
}
