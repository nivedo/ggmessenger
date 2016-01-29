// Mutation Observer to detect DOM Changes
var observeDOM = (function(){
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
    eventListenerSupported = window.addEventListener;

  return function(obj, callback){
    if( MutationObserver ){
      // define a new observer
      var obs = new MutationObserver(function(mutations, observer){
        if( mutations[0].addedNodes.length || mutations[0].removedNodes.length)
          if( mutations[0].target.nodeName != "SPAN" )
            callback();
      });
      // have the observer observe foo for changes in children
      obs.observe( obj, { childList:true, subtree:true });
    }
    else if( eventListenerSupported ){
      obj.addEventListener('DOMNodeInserted', callback, false);
      obj.addEventListener('DOMNodeRemoved', callback, false);
    }
  }
})();

// Observe a specific DOM element:
observeDOM( document.querySelector('._1q5-') ,function(){
  CallbackMTG()
});
