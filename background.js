// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// A generic onclick callback function.

var store= {
    windowId : -1,
    tabId : -1,
    tabIndex : -1
};

async function genericOnClick(info, tab) {
//   console.log("item " + info.menuItemId + " was clicked");
//   console.log("info: " + JSON.stringify(info));
//   console.log("tab: " + JSON.stringify(tab));
//   let moveProperties = {
//   };
//   var moveComplete = await chrome.tabs.move(tab.id, moveProperties);
    var cstore={
        windowId : -1,
        tabId : -1,
        tabIndex : -1
    };
    try {
        var queryInfo = {};
        var queryResults = await chrome.tabs.query(queryInfo)
        for(let i=0; i<queryResults.length; i++) {
            if (queryResults[i].id == tab.id) {
                cstore.windowId = queryResults[i].windowId;
                cstore.tabIndex = queryResults[i].index;
                cstore.tabId    = tab.id;
                break;
            }
        }
        
        var getWindowInfo = { windowTypes : ["normal"] }
        var currentTabWindow = await chrome.windows.get(cstore.windowId, getWindowInfo);
        console.log("window");
        console.log(currentTabWindow);
        
        if ( currentTabWindow.state == "fullscreen" ) {
            if (  store.windowId === -1) return;
            let updateInfo = {state: "normal"};
            var normalTabWindow = await chrome.windows.update(currentTabWindow.id, updateInfo);

            let moveProperties = {"windowId": store.windowId, "index": store.tabIndex};
            var movedTab = await chrome.tabs.move(tab.id, moveProperties);
            var updateProperties = {active: true};
            chrome.tabs.update(movedTab.id, updateProperties);
            
            console.log("normal screen");
            store.windowId = -1;
            store.tabId = -1;
            store.tabId = -1;
            store.tabIndex  = -1;
            console.log("store value");
            console.log(store);
        } else {
            store = cstore;
            console.log("store value");
            console.log(store);
            let createData = {
                "tabId": tab.id,
                "type": "normal",
                "state": "fullscreen"
            };
            chrome.windows.create(createData);
            console.log("full screen");
        } 
    } catch (error) {
        console.log(error);
    }
};
                              


// Create one test item for each context type.
// var contexts = ["page","selection","link","editable","image","video",
//                 "audio"];
var contexts = ["all"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
//   var title = "Test '" + context + "' menu item";
  var title = "전체 화면"
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});

  console.log("'" + context + "' item:" + id);
}


// Create a parent item and two children.
// var parent = chrome.contextMenus.create({"title": "Test parent item"});
// var child1 = chrome.contextMenus.create(
//   {"title": "Child 1", "parentId": parent, "onclick": genericOnClick});
// var child2 = chrome.contextMenus.create(
//   {"title": "Child 2", "parentId": parent, "onclick": genericOnClick});
// console.log("parent:" + parent + " child1:" + child1 + " child2:" + child2);


// Create some radio items.
// function radioOnClick(info, tab) {
//   console.log("radio item " + info.menuItemId +
//               " was clicked (previous checked state was "  +
//               info.wasChecked + ")");
// }
// var radio1 = chrome.contextMenus.create({"title": "Radio 1", "type": "radio",
//                                          "onclick":radioOnClick});
// var radio2 = chrome.contextMenus.create({"title": "Radio 2", "type": "radio",
//                                          "onclick":radioOnClick});
// console.log("radio1:" + radio1 + " radio2:" + radio2);


// Create some checkbox items.
// function checkboxOnClick(info, tab) {
//   console.log(JSON.stringify(info));
//   console.log("checkbox item " + info.menuItemId +
//               " was clicked, state is now: " + info.checked +
//               "(previous state was " + info.wasChecked + ")");

// }
// var checkbox1 = chrome.contextMenus.create(
//   {"title": "Checkbox1", "type": "checkbox", "onclick":checkboxOnClick});
// var checkbox2 = chrome.contextMenus.create(
//   {"title": "Checkbox2", "type": "checkbox", "onclick":checkboxOnClick});
// console.log("checkbox1:" + checkbox1 + " checkbox2:" + checkbox2);


// Intentionally create an invalid item, to show off error checking in the
// create callback.
// console.log("About to try creating an invalid item - an error about " +
//             "item 999 should show up");
// chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
//   if (chrome.extension.lastError) {
//     console.log("Got expected error: " + chrome.extension.lastError.message);
//   }
// });                            