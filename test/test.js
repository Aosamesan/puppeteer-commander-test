import { execute } from '../lib';

execute(
    `
    launch C:/Program Files/Google/Chrome/Application/chrome.exe
    navigate https://www.nate.com
    screenshot ./nate.png
    quit
    `
)