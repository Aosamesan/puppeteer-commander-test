import puppeteer from 'puppeteer-core';

async function launch({ param }) {
    const [executablePath] = param;
    if (!executablePath) {
        throw new Error("CHROMIUM_EXECUTABLE_PATH is undefined");
    }
    return await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        executablePath
    }).catch(err => console.error(err));
}

async function navigate({ param, browser }) {
    const [url] = param;
    const page = (await browser.pages())[0];
    await page.goto(url, {
        waitUntil: 'networkidle2'
    });
    return browser;
}

async function screenshot({ param, browser }) {
    const [filePath] = param;
    const page = (await browser.pages())[0];
    await page.screenshot({
        path: filePath
    });
    return browser;
}

async function quit({ browser }) {
    await browser.close();
}

export default class Commander {
    constructor () {
        this.parser = new CommandParser();
    }

    async run(script) {
        const commands = script.split(/[\r\n]+/g);
        const tasks = commands
            .filter(s => s.trim())
            .map(line => this.parser.parseLine(line));
        await this.recursiveRun(tasks)
    }

    async recursiveRun(tasks, browser = null) {
        if (tasks.length > 0) {
            const {
                task,
                param
            } = tasks[0];
            return await task({ param, browser })
                .then((b) => this.recursiveRun(tasks.slice(1), b))
                .catch(err => console.error(err));
        }
    }
}

class CommandParser {
    constructor () {
        this._commandList = [
            {
                command: /^launch$/i,
                task: launch
            },
            {
                command: /^quit$/i,
                task: quit
            },
            {
                command: /^navigate$/i,
                task: navigate
            },
            {
                command: /^screenshot$/i,
                task: screenshot
            }
        ];
    }

    parseLine(line) {
        let _, command, param;
        if (/^quit$/i.test(line.trim())) {
            command = 'quit';
            param = [];
        } else {
            [_, command, ...param] = line.trim().match(/^(\S+)\s(.*)/);
        }
        const {
            task
        } = this._commandList.find(({ command: cmd }) => cmd.test(command));
        if (!task) {
            throw new Error("Command not found : " + command);
        }
        return {
            task,
            param
        };
    }
}