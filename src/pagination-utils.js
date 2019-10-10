function getFrameStartEnd(currentPage, totalPages){
  let start = currentPage - 2;
  let end = currentPage + 2;

  if (currentPage >= totalPages - 1) {
    end = totalPages;
    start = totalPages < 5 ? 1 : totalPages - 4;
  } else if (currentPage <= 2) {
    end = totalPages < 5 ? totalPages : 5;
    start = 1;
  }

  return {start: start, end: end};
}

function changePageTo(table, targetPage){
  table.pagination.currentPage = targetPage;
  console.log('page changed');
  table.serializeLinkOptions();
  table.redrawData();
}

function onPageChangeKey(table, event){
  if (event.keyCode == 37){
    changePageTo(table, table.pagination.currentPage > 1 ? table.pagination.currentPage - 1 : 1)
    //table.pagination.currentPage = table.pagination.currentPage > 1 ? table.pagination.currentPage - 1 : 1;
    //table.redrawData();
  } else if (event.keyCode == 39){
    changePageTo(table, table.pagination.currentPage < table.pagination.totalPages ? table.pagination.currentPage + 1 : table.pagination.totalPages);
    //table.pagination.currentPage = table.pagination.currentPage < table.pagination.totalPages ? table.pagination.currentPage + 1 : table.pagination.totalPages;
    //table.redrawData();
  }
}

function clickHandlerDocument(table, event) {
  let keyChangeListener = onPageChangeKey.bind(null, table);

  document.removeEventListener('keyup', keyChangeListener);
  
  if(table.elements.pageChooser == event.target || table.elements.pageChooser == event.target.parentNode){
    document.addEventListener('keyup', keyChangeListener);
    table.elements.pageChooser.classList.add('selected');
  } else {
    table.elements.pageChooser.classList.remove('selected');
  }
}

let clickHandlerBoundCall = undefined;

function addKeyHandlerToDocument(table){
  if(!clickHandlerBoundCall) clickHandlerBoundCall = clickHandlerDocument.bind(null, table);
  document.removeEventListener('click', clickHandlerBoundCall);
  document.addEventListener('click', clickHandlerBoundCall);
}

function createPageChooser(table, data) {
  let element = document.createElement('div');
  let currentPage = table.pagination.currentPage;
  let totalPages = table.pagination.totalPages;
  if (table.pagination.active) {
    element.classList.add('page-chooser', 'pagination');
    let front_disabled = currentPage == 1
    let back_disabled = currentPage == totalPages;
    element.append(createPageChooserChild('<<', table, 1, false, front_disabled));
    element.append(createPageChooserChild('<', table, currentPage - 1, false, front_disabled));
    let {start, end} = getFrameStartEnd(currentPage, totalPages);
    for (let i = start; i <= end; i++) {
      if (currentPage == i) {
        element.append(createPageChooserChild(i.toString(), table, i, true));
      } else {
        element.append(createPageChooserChild(i.toString(), table, i));
      }
    }
    element.append(createPageChooserChild('>', table, currentPage + 1, false, back_disabled));
    element.append(createPageChooserChild('>>', table, totalPages, false, back_disabled));
  }
  return element;
}

function createPageChooserChild(content, table, targetPage, isCurrent, isDisabled) {
  let element = document.createElement('div');
  element.innerHTML = content;
  element.classList.add('page-change', 'pagination');
  if (isCurrent) {
    element.classList.add('active-page');
  } else {
    if (isDisabled) {
      element.classList.add('page-change-disabled');
    } else {
      element.addEventListener('click', (event) => {
        changePageTo(table, targetPage)
        //table.pagination.currentPage = targetPage;
        //table.redrawData();
      });
    }
  }
  return element;
}

module.exports = {
  getFrameStartEnd,
  createPageChooser,
  createPageChooserChild,
  addKeyHandlerToDocument,
  changePageTo,
}