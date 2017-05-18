// Copyright (c) 2017 jo-taro. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var tabLocations = new Map();

function makeTabLocation (windowId, tab) {
    return 
}

async function onClick(info, tab) {
    try {
        const currentWindow = await chrome.windows.getCurrent();
        const winId = currentWindow.id;
        const isFullscreen = currentWindow.state === "fullscreen";
        
        if ( tabLocations.has(winId) ) {
            if ( isFullscreen ) {
                doNormalScreen(winId, tab.id);
            } else {
                // this window is already in normal mode, 
                // but required to be in normal, so delete inconsistent information
                tabLocations.delete(winId);
            }
        } else {
            doFullscreen(winId, tab.id);
        } 

    } catch (error) {
        console.log(error);
    }
};

function makeTabLocation(winId, tabIndex) {
    return { windowId : winId, tabIndex : tabIndex};
}

async function doFullScreen(winId, tabId) {
    
    // retreive current tab
    const currentTab = await chrome.tabs.get(tabId);

    // make new window with current tab
    const createData = {
        tabId : currentTab.id,
        type  : "normal",
        state : "fullscreen"
    };
    const fullscreenWindow = await chrome.windows.create(createData);

    // store previous window,tabindex of tab of fullscreen window
    const tabLocation  = makeTabLocation(winId, currentTab.index);
    tabLocations.set( fullscreenWindow.id, tabLocation);

    console.log("full screen");
}

async function doNormalscreen(winId, tabId) {
    
    // make window of current tab normal because
    // chrome.tabs.move only works in normal window mode
    const updateInfo = {state: "normal"};
    const normalTabWindow = await chrome.windows.update(winId, updateInfo);
    
    // after window state is normal, delete stored tab location
    // because current window is no longer in fullscreen
    const tabLocation = tabLocations.get(winId);
    tabLocations.delete(winId);

    // move current tab to original position of original window 
    // NOTE: original window may be changed, so position can be incorrect
    const moveProperties = { windowId : tabLocation.windowId, index: tabLocation.tabIndex };
    const movedTab = await chrome.tabs.move(tabId, moveProperties);
    
    // finally make moved tab active
    const updateProperties = {active: true};
    chrome.tabs.update(movedTab.id, updateProperties);

    console.log("normal screen");
}

const title = "전체 화면"
const createInfo = {"title": title, "contexts":["all"], "onclick": onClick};
chrome.contextMenus.create(createInfo);
