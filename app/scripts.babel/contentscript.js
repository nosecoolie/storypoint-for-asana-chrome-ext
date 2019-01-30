'use strict';

// 定数
const SP_BADGES = ['?','0','0.5','1','2','3','5','8','13','21']
const badgeStyle = {
    background: '#3498db',
    borderRadius: '12px',
    minWidth: '14px',
    height: '16px',
    padding: '5px',
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginLeft: '4px',
    cursor: 'pointer'
}
const countStyle = {
  'padding': '0 5px',
  'color': '#000',
  'opacity': '0.7',
  'text-align': 'center',
  'font-weight': 'bold',
  'margin-left': '4px',
  'font-size': '18px'
}

const clearBadgeColor = '#95a5a6';
const syncSubtaskBadgeColor = '#1abc9c';
const completedBadgeColor = '#f39c12';


// Board
// バッジの表示 (カード表示時)
setInterval(() => {
    // 操作するエレメント
    const bodyContainerPromise = getElementUntilRendered(document,'.SingleTaskPane-body', 100)
    const descriptionContainerPromise = getElementUntilRendered(document,'.SingleTaskPane-descriptionRow', 100)
    const titleTextAreaPromise = getElementUntilRendered(document,'.simpleTextarea--dynamic', 100)

    // 操作するエレメントがすべて取得できたら (カード表示時)
    Promise.all([bodyContainerPromise, descriptionContainerPromise, titleTextAreaPromise])
        .then(([bodyContainer, descriptionContainer, titleTextArea]) => {
            // 既にバッジが表示されているか
            const hasBadgeContainer = document.getElementsByClassName('badge-container').length !== 0
            if(hasBadgeContainer){
                return ;
            }

            const badgeElements2 = SP_BADGES.map(e => {
                const badgeElement2 = document.createElement('span')
                badgeElement2.textContent = e
                Object.keys(badgeStyle).forEach(key => {
                    badgeElement2.style[key] = badgeStyle[key]
                })
                badgeElement2.style.background = 'rgb(243, 156, 18)'
                badgeElement2.addEventListener('click', function(e){
                    titleTextArea.focus()
                    titleTextArea.value = '(R:' + e.target.textContent + ')' + titleTextArea.value.replace(/\(R:\d*\)/, '')
                    var evt = document.createEvent('KeyboardEvent');
                    evt.initEvent('input', true, false);
                    // adding this created a magic and passes it as if keypressed
                    titleTextArea.dispatchEvent(evt);
                    titleTextArea.blur()
                }, false)
                return badgeElement2
            })
            // クリアバッジの生成
            // const clearBadge2 = (()=>{
            //     const badgeElement2 = document.createElement('span')
            //     badgeElement2.textContent = 'clear'
            //     Object.keys(badgeStyle).forEach(key => {
            //         badgeElement2.style[key] = badgeStyle[key]
            //     })
            //     badgeElement2.style.background = clearBadgeColor

            //     badgeElement2.addEventListener('click', function(e){
            //         titleTextArea.focus()
            //         titleTextArea.value = titleTextArea.value.replace(/^\(.+\) /, '').replace(/ \[.+\]/, '')
            //         var evt = document.createEvent('KeyboardEvent');
            //         evt.initEvent('input', true, false);
            //         // adding this created a magic and passes it as if keypressed
            //         titleTextArea.dispatchEvent(evt);
            //         titleTextArea.blur()
            //     }, false)
            //     return badgeElement2
            // })()
            // badgeElements2.unshift(clearBadge2);






            // バッジの生成
            const badgeElements = SP_BADGES.map(e => {
                const badgeElement = document.createElement('span')
                badgeElement.textContent = e
                Object.keys(badgeStyle).forEach(key => {
                    badgeElement.style[key] = badgeStyle[key]
                })
                badgeElement.addEventListener('click', function(e){
                    titleTextArea.focus()
                    titleTextArea.value = '(E:' + e.target.textContent + ')' + titleTextArea.value.replace(/\(E:\d*\)/, '')
                    var evt = document.createEvent('KeyboardEvent');
                    evt.initEvent('input', true, false);
                    // adding this created a magic and passes it as if keypressed
                    titleTextArea.dispatchEvent(evt);
                    titleTextArea.blur()
                }, false)
                return badgeElement
            })
            // クリアバッジの生成
            const clearBadge = (()=>{
                const badgeElement = document.createElement('span')
                badgeElement.textContent = 'clear'
                Object.keys(badgeStyle).forEach(key => {
                    badgeElement.style[key] = badgeStyle[key]
                })
                badgeElement.style.background = clearBadgeColor

                badgeElement.addEventListener('click', function(e){
                    titleTextArea.focus()
                    titleTextArea.value = titleTextArea.value.replace(/^\(.+\) /, '').replace(/ \[.+\]/, '')
                    var evt = document.createEvent('KeyboardEvent');
                    evt.initEvent('input', true, false);
                    // adding this created a magic and passes it as if keypressed
                    titleTextArea.dispatchEvent(evt);
                    titleTextArea.blur()
                }, false)
                return badgeElement
            })()
            badgeElements.unshift(clearBadge);
            // サブタスク更新バッジの生成 (ボタンを押すとサブタスクにセットしたSPを計算しこのタスクのSPにセットする)
            const syncSubtaskBadge = (()=>{
                const badgeElement = document.createElement('span')
                badgeElement.textContent = 'sync subtasks'
                Object.keys(badgeStyle).forEach(key => {
                    badgeElement.style[key] = badgeStyle[key]
                })
                badgeElement.style.background = syncSubtaskBadgeColor

                badgeElement.addEventListener('click', function(e){
                    // サブタスクのSPを集計
                    const subtasks = document.getElementsByClassName('SubtaskTaskRow')
                    let subtasksNotCompletedStoryPoint = 0, subtasksCompletedStoryPoint = 0;
                    Array.prototype.forEach.call(subtasks, e => {
                        const isCompleted = !!e.querySelector('.TaskRowCompletionStatus-checkbox--complete')
                        const subtaskTitleElement = e.querySelector('.autogrowTextarea-shadow')
                        if(subtaskTitleElement){
                            const sp_matched = subtaskTitleElement.textContent.match(/^\((\d+(?:\.\d+)?)\)/)
                            if(sp_matched){
                                if(isCompleted) {
                                    subtasksCompletedStoryPoint += Number(sp_matched[1])
                                }
                                subtasksNotCompletedStoryPoint += Number(sp_matched[1])
                            }
                        }
                    })
                    const titlePrefix = (() => {
                        if(subtasksNotCompletedStoryPoint){
                            return '(' + subtasksNotCompletedStoryPoint + ') '
                        }
                        return ''
                    })()
                    const titlePostfix = (() => {
                        if(subtasksCompletedStoryPoint){
                            return ' [' + subtasksCompletedStoryPoint + ']'
                        }
                        return ''
                    })()


                    // 編集
                    titleTextArea.focus()
                    titleTextArea.value = titlePrefix + titleTextArea.value.replace(/^\(.+\) /, '').replace(/ \[.+\]/, '') + titlePostfix
                    var evt = document.createEvent('KeyboardEvent');
                    evt.initEvent('input', true, false);
                    // adding this created a magic and passes it as if keypressed
                    titleTextArea.dispatchEvent(evt);
                    titleTextArea.blur()
                }, false)
                return badgeElement
            })()
            badgeElements.push(syncSubtaskBadge);

            // バッジコンテナの生成
            let badgeContainer = document.createElement('div')
            badgeContainer.style.display = 'flex'
            badgeContainer.className = 'badge-container'

            let badgeContainer2 = document.createElement('div')
            badgeContainer2.style.display = 'flex'
            badgeContainer2.className = 'badge-container2'

            // バッジコンテナにバッジの挿入
            badgeElements.forEach(e => {
                badgeContainer.appendChild(e)
            })
            badgeElements2.forEach(e => {
                badgeContainer2.appendChild(e)
            })

            // バッジコンテナをDOMに設置
            bodyContainer.insertBefore(badgeContainer, descriptionContainer)
            bodyContainer.insertBefore(badgeContainer2, descriptionContainer)
        })
}, 1000)

// ボード上カード列別のポイント合計を上部に表示
setInterval(() => {
    // 操作するエレメント
    const boardColumnsPromise = getElementsUntilRendered(document, '.≈', 100)
    // 操作するエレメントがすべて取得できたら (カード表示時)
    boardColumnsPromise
        .then(boardColumns => {
            let totalNotCompletedStoryPoint = 0, totalCompletedStoryPoint = 0;
            // 各カラム別集計
            boardColumns.forEach(boardColumn => {
                // 操作するエレメント
                const boardColumnHeader = boardColumn.querySelector('.BoardColumnHeader')
                const boardCardNames = boardColumn.querySelectorAll('.BoardCardWithCustomProperties-name')
                // SPの計算
                let columnTotalNotCompletedStoryPoint = 0, columnTotalCompletedStoryPoint = 0;
                Array.prototype.forEach.call(boardCardNames, (e) => {
                    const isCompleted = e.getElementsByTagName('svg').length !== 0;
                    const sp_matched = e.textContent.match(/^\((\d+(?:\.\d+)?)\)/) // SP   例: (10) タスク => 10
                    const sp_subtask_completed_matched = e.textContent.match(/\[(\d+(?:\.\d+)?)\]$/) // 部分完了タスクSP   例: (10) タスク [5]  => 5/5
                    if(sp_matched){
                        if(isCompleted) {
                            columnTotalCompletedStoryPoint += Number(sp_matched[1])
                        } else {
                            if(sp_subtask_completed_matched) {
                                // サブタスクの完了SPがある
                                columnTotalNotCompletedStoryPoint += Number(sp_matched[1]) - Number(sp_subtask_completed_matched[1])
                                columnTotalCompletedStoryPoint += Number(sp_subtask_completed_matched[1])
                            } else {
                                columnTotalNotCompletedStoryPoint += Number(sp_matched[1])
                            }
                        }
                    }
                })
                totalNotCompletedStoryPoint += columnTotalNotCompletedStoryPoint
                totalCompletedStoryPoint += columnTotalCompletedStoryPoint

                // 件数
                {
                    const hasTotalCountElement = boardColumn.querySelector('.columntop-count-story-point')
                    if(hasTotalCountElement){
                        hasTotalCountElement.textContent = boardCardNames.length
                    } else {
                        // 上部に表示する合計バッジを生成
                        let totalStoryPointElement = document.createElement('span')
                        totalStoryPointElement.className = 'columntop-count-story-point'
                        totalStoryPointElement.textContent = boardCardNames.length
                        Object.keys(countStyle).forEach(key => {
                            totalStoryPointElement.style[key] = countStyle[key]
                        })

                        boardColumnHeader.appendChild(totalStoryPointElement)
                    }
                }
                // 未終了StoryPoint
                {
                    const hasTotalStoryPointElement = boardColumn.querySelector('.columntop-notcompleted-story-point')
                    if(hasTotalStoryPointElement){
                        hasTotalStoryPointElement.textContent = columnTotalNotCompletedStoryPoint
                    } else {
                        // 上部に表示する合計バッジを生成
                        let totalStoryPointElement = document.createElement('span')
                        totalStoryPointElement.className = 'columntop-notcompleted-story-point'
                        totalStoryPointElement.textContent = columnTotalNotCompletedStoryPoint
                        Object.keys(badgeStyle).forEach(key => {
                            totalStoryPointElement.style[key] = badgeStyle[key]
                        })

                        boardColumnHeader.appendChild(totalStoryPointElement)
                    }
                }
                // 終了StoryPoint (こちらは1ポイント以上あるときのみ表示)
                {
                    const hasTotalStoryPointElement = boardColumn.querySelector('.columntop-completed-story-point')
                    if(hasTotalStoryPointElement){
                        // 0件なら表示しない
                        if(columnTotalCompletedStoryPoint === 0){
                            hasTotalStoryPointElement.parentNode.removeChild(hasTotalStoryPointElement)
                            return
                        }

                        hasTotalStoryPointElement.textContent = columnTotalCompletedStoryPoint
                    } else {
                        // 0件なら表示しない
                        if(columnTotalCompletedStoryPoint === 0){
                            return
                        }

                        // 上部に表示する合計バッジを生成
                        let totalStoryPointElement = document.createElement('span')
                        totalStoryPointElement.className = 'columntop-completed-story-point'
                        totalStoryPointElement.textContent = columnTotalCompletedStoryPoint
                        Object.keys(badgeStyle).forEach(key => {
                            totalStoryPointElement.style[key] = badgeStyle[key]
                        })
                        totalStoryPointElement.style.background = completedBadgeColor

                        boardColumnHeader.appendChild(totalStoryPointElement)
                    }
                }
            })

            // ボード内合計 (ボード上部のプロジェクト名 右横に表示)
            const boardTitleContainer = document.querySelector('.TopbarPageHeaderStructure-titleRow')
            if(!boardTitleContainer) return ;
            {
                const hasTotalStoryPointElement = document.querySelector('.boardtop-notcompleted-story-point')
                if(hasTotalStoryPointElement) {
                    hasTotalStoryPointElement.textContent = totalNotCompletedStoryPoint
                } else {
                    // 0件なら表示しない
                    if(totalNotCompletedStoryPoint === 0) {
                        return
                    }
                    // 合計未完了SPバッジを表示
                    let totalStoryPointElement = document.createElement('span')
                    totalStoryPointElement.className = 'boardtop-notcompleted-story-point'
                    totalStoryPointElement.textContent = totalNotCompletedStoryPoint
                    Object.keys(badgeStyle).forEach(key => {
                        totalStoryPointElement.style[key] = badgeStyle[key]
                    })
                    boardTitleContainer.appendChild(totalStoryPointElement)
                }
            }
            // 合計完了SPバッジを表示
            {
                const hasTotalStoryPointElement = document.querySelector('.boardtop-completed-story-point')
                if(hasTotalStoryPointElement) {
                    // 0件なら表示しない
                    if(totalCompletedStoryPoint === 0){
                        hasTotalStoryPointElement.parentNode.removeChild(hasTotalStoryPointElement)
                        return
                    }

                    hasTotalStoryPointElement.textContent = totalCompletedStoryPoint
                } else {
                    // 0件なら表示しない
                    if(totalCompletedStoryPoint === 0) {
                        return
                    }
                    let totalStoryPointElement = document.createElement('span')
                    totalStoryPointElement.className = 'boardtop-completed-story-point'
                    totalStoryPointElement.textContent = totalCompletedStoryPoint
                    Object.keys(badgeStyle).forEach(key => {
                        totalStoryPointElement.style[key] = badgeStyle[key]
                    })
                    totalStoryPointElement.style.background = completedBadgeColor
                    boardTitleContainer.appendChild(totalStoryPointElement)
                }
            }

        })

}, 1000)

// List
// セクション合計を右横に表示
setInterval(() => {
    // 操作するエレメント
    const listSectionsPromise = getElementsUntilRendered(document, '.ItemRow.ItemRow--enabled.DraggableItemRow-item.SectionRow', 100)

    // 操作するエレメントがすべて取得できたら (カード表示時)
    listSectionsPromise
        .then(listSections => {
            let totalNotCompletedStoryPoint = 0, totalCompletedStoryPoint = 0;

            // 各カラム別集計
            listSections.forEach(listSection => {

                // 操作するエレメント
                const listSectionHeader = listSection
                const listSectionDropTargetRow = listSection.parentElement

                // SPの計算
                let columnTotalNotCompletedStoryPoint = 0, columnTotalCompletedStoryPoint = 0;

                // 手続き的ループ: 次の ListSectionに辿り着くまで１つずつ進む
                let cnt = 0
                let nextRow = listSectionDropTargetRow.nextElementSibling
                while( cnt < 1000 && nextRow && nextRow.querySelector('.ItemRow.ItemRow--enabled.DraggableItemRow-item.TaskRow') ) {

                    const titleElement = nextRow.querySelector('.TaskName-input.override-focus-border')
                    const title = titleElement.textContent

                    const isCompleted = title.match(/\(R:(\d*)\)/)
                    // const isCompleted = !!nextRow.querySelector('.TaskRow--completed');
                    const sp_matched = title.match(/\(E:(\d*)\)/)
                    // const sp_matched = title.match(/^\((\d+(?:\.\d+)?)\)/) // SP   例: (10) タスク => 10
                    const sp_subtask_completed_matched = title.match(/\[(\d+(?:\.\d+)?)\]$/) // 部分完了タスクSP   例: (10) タスク [5]  => 5/5
                    if(isCompleted) {
                        columnTotalCompletedStoryPoint += +isCompleted[1]
                    }
                    if(sp_matched){
                        // if(isCompleted) {
                        //     columnTotalCompletedStoryPoint += +isCompleted[1]
                        // } else {
                        if(sp_subtask_completed_matched) {
                            // サブタスクの完了SPがある
                            columnTotalNotCompletedStoryPoint += Number(sp_matched[1]) - Number(sp_subtask_completed_matched[1])
                            // columnTotalCompletedStoryPoint += Number(sp_subtask_completed_matched[1])
                        } else {
                            columnTotalNotCompletedStoryPoint += Number(sp_matched[1])
                        }
                        // }
                    }
                    nextRow = nextRow.nextElementSibling
                    ++cnt
                }
                totalNotCompletedStoryPoint += columnTotalNotCompletedStoryPoint
                totalCompletedStoryPoint += columnTotalCompletedStoryPoint

                // 未終了StoryPoint
                {
                    const hasTotalStoryPointElement = listSection.querySelector('.columntop-notcompleted-story-point')
                    if(hasTotalStoryPointElement){
                        hasTotalStoryPointElement.textContent = columnTotalNotCompletedStoryPoint
                    } else {
                        // 上部に表示する合計バッジを生成
                        let totalStoryPointElement = document.createElement('span')
                        totalStoryPointElement.className = 'columntop-notcompleted-story-point'
                        totalStoryPointElement.textContent = columnTotalNotCompletedStoryPoint
                        Object.keys(badgeStyle).forEach(key => {
                            totalStoryPointElement.style[key] = badgeStyle[key]
                        })

                        // 右端に追加
                        listSectionHeader.appendChild(totalStoryPointElement)
                        // タイトルの左隣に追加
                        //const t = listSectionHeader.querySelector('.SectionRow-sectionName')
                        //listSectionHeader.insertBefore(totalStoryPointElement, t)
                    }
                }
                // 終了StoryPoint (こちらは1ポイント以上あるときのみ表示)
                {
                    const hasTotalStoryPointElement = listSection.querySelector('.columntop-completed-story-point')
                    if(hasTotalStoryPointElement){
                        // 0件なら表示しない
                        if(columnTotalCompletedStoryPoint === 0){
                            hasTotalStoryPointElement.parentNode.removeChild(hasTotalStoryPointElement)
                            return
                        }

                        hasTotalStoryPointElement.textContent = columnTotalCompletedStoryPoint
                    } else {
                        // 0件なら表示しない
                        if(columnTotalCompletedStoryPoint === 0){
                            return
                        }

                        // 上部に表示する合計バッジを生成
                        let totalStoryPointElement = document.createElement('span')
                        totalStoryPointElement.className = 'columntop-completed-story-point'
                        totalStoryPointElement.textContent = columnTotalCompletedStoryPoint
                        Object.keys(badgeStyle).forEach(key => {
                            totalStoryPointElement.style[key] = badgeStyle[key]
                        })
                        totalStoryPointElement.style.background = completedBadgeColor

                        listSectionHeader.appendChild(totalStoryPointElement)
                    }
                }
            })

            // ボード内合計 (ボード上部のプロジェクト名 右横に表示)
            const boardTitleContainer = document.querySelector('.TopbarPageHeaderStructure-titleRow')
            if(!boardTitleContainer) return ;
            {
                const hasTotalStoryPointElement = document.querySelector('.boardtop-notcompleted-story-point')
                if(hasTotalStoryPointElement) {
                    hasTotalStoryPointElement.textContent = totalNotCompletedStoryPoint
                } else {
                    // 0件なら表示しない
                    if(totalNotCompletedStoryPoint === 0) {
                        return
                    }
                    // 合計未完了SPバッジを表示
                    let totalStoryPointElement = document.createElement('span')
                    totalStoryPointElement.className = 'boardtop-notcompleted-story-point'
                    totalStoryPointElement.textContent = totalNotCompletedStoryPoint
                    Object.keys(badgeStyle).forEach(key => {
                        totalStoryPointElement.style[key] = badgeStyle[key]
                    })
                    boardTitleContainer.appendChild(totalStoryPointElement)
                }
            }
            // 合計完了SPバッジを表示
            {
                const hasTotalStoryPointElement = document.querySelector('.boardtop-completed-story-point')
                if(hasTotalStoryPointElement) {
                    // 0件なら表示しない
                    if(totalCompletedStoryPoint === 0){
                        hasTotalStoryPointElement.parentNode.removeChild(hasTotalStoryPointElement)
                        return
                    }

                    hasTotalStoryPointElement.textContent = totalCompletedStoryPoint
                } else {
                    // 0件なら表示しない
                    if(totalCompletedStoryPoint === 0) {
                        return
                    }
                    let totalStoryPointElement = document.createElement('span')
                    totalStoryPointElement.className = 'boardtop-completed-story-point'
                    totalStoryPointElement.textContent = totalCompletedStoryPoint
                    Object.keys(badgeStyle).forEach(key => {
                        totalStoryPointElement.style[key] = badgeStyle[key]
                    })
                    totalStoryPointElement.style.background = completedBadgeColor
                    boardTitleContainer.appendChild(totalStoryPointElement)
                }
            }

        })

}, 1000)

/**
 * 要素が取得できるまでループする関数 (max500ms)
 * @param {*} query
 * @param {*} wait ms
 */
function getElementUntilRendered(parent, query, wait) {
    return new Promise ((resolve, reject) => {
        function iter(counter) {
            if(counter*wait >= 500) {
                return reject()
            }
            const e = parent.querySelector(query)
            if(e) {
                return resolve(e)
            } else {
                return setTimeout(iter.bind(this, counter+1), wait)
            }
        }
        iter(0)
    })
}

/**
 * 要素が取得できるまでループする関数 (max500ms)
 * @param {*} query
 * @param {*} wait ms
 */
function getElementsUntilRendered(parent, query, wait) {
    return new Promise ((resolve, reject) => {
        function iter(counter) {
            if(counter*wait >= 500) {
                return reject()
            }
            const e = parent.querySelectorAll(query)
            if(e.length > 0) {
                return resolve(e)
            } else {
                return setTimeout(iter.bind(this, counter+1), wait)
            }
        }
        iter(0)
    })
}