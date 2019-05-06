// Copyright (c) 2017 jo-taro. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var tabLocations = new Map();

function contextMenuHandler (info, tab) {
    return toggleFullScreen(tab);
}

async function toggleFullScreen(tab) {
    try {
        const currentWindow = await chrome.windows.getCurrent();
        const winId = currentWindow.id;
        const isFullscreen = currentWindow.state === "fullscreen";
        
        if ( tabLocations.has(winId) ) {
            doNormalScreen(winId, tab.id, tabLocations.get(winId));
        } else {
            doFullScreen(winId, tab.id);
        } 

    } catch (error) {
        console.log(error);
    }
}

function makeTabLocation(winId, tabIndex) {
    return { windowId : winId, tabIndex : tabIndex};
}

async function doFullScreen(winId, tabId) {
    
    // retreive current tab
    const currentTab = await chrome.tabs.get(tabId);

    // make new window with current tab
    const newWindow = await chrome.windows.create({ tabId: currentTab.id, type: "normal" });

    // store previous window,tabindex of tab of fullscreen window
    const tabLocation = makeTabLocation(winId, currentTab.index);
    tabLocations.set( newWindow.id, tabLocation);

    console.log("created new window for the fullscreen", newWindow.id);

    // update state of window to fullscreen
    const fullscreenWindow = await chrome.windows.update(newWindow.id, { state: "fullscreen" });

    console.log("update window state fullscreen completed: ", fullscreenWindow.id);
}

async function doNormalScreen(winId, tabId, tabLocation) {
    
    // make window of current tab normal because
    // chrome.tabs.move only works in normal window mode
    const updateInfo = {state: "normal"};
    const normalTabWindow = await chrome.windows.update(winId, updateInfo);
    
    // move current tab to original position of original window 
    // NOTE: original window may be changed, so position can be incorrect
    const moveProperties = { windowId : tabLocation.windowId, index: tabLocation.tabIndex };
    const movedTab = await chrome.tabs.move(tabId, moveProperties);
    
    
    // finally make moved tab active
    const updateProperties = {active: true};
    const updatedTab = await chrome.tabs.update(movedTab.id, updateProperties);
    chrome.windows.remove(winId, () => console.log("removed: " + winId));
    // after all movement is completed, delete stored tab location
    tabLocations.delete(winId);

    console.log("normal screen");
}

async function commandHandler (command) {
    
    if ( command === "toggle-fullscreen") {
        const queryInfo = {active: true, currentWindow: true};
        const tabs = await chrome.tabs.query(queryInfo);
    
        if ( tabs.length === 1) {
            toggleFullScreen(tabs[0]);
        } else {
            console.log("No active tab in current window??!!");
        }
    }
}

const title = "전체 화면 토글"
const createInfo = {"title": title, "contexts":["all"], "onclick": contextMenuHandler};
chrome.contextMenus.create(createInfo);

chrome.windows.onRemoved.addListener( winId => tabLocations.delete(winId) );
chrome.commands.onCommand.addListener( commandHandler );
chrome.browserAction.onClicked.addListener(toggleFullScreen);
