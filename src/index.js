import '@babel/polyfill';
import Commander from './commander';

export async function executeAsync(script) {
    const commander = new Commander({
        defaultViewport: null,
        headless: false,
    });
    return await commander.run(script);
};

export function execute(script) {
    Promise.all([executeAsync(script)])
        .catch(err => console.error(err));
}