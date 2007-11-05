var dom_data = new function()
{
  var self = this;

  var view_id = 'dom-inspector';  // this needs to bre handled in a more general and sytematic way.

  var initializedRuntimes = {};

  var data = []; // TODO seperated for all runtimes off the active tab

  const 
  ID = 0, 
  TYPE = 1, 
  NAME = 2, 
  NAMESPACE = 3, 
  VALUE = 4, 
  DEPTH = 5, 
  ATTRS = 6, 
  CHILDREN_LENGTH = 7, 
  IS_TARGET = 8, 
  IS_LAST = 9;

  var initRuntime_hostside = function(runtime_id)
  {
    return [
      runtime_id,
      window.document,
      function(ele)  
      {
        var data = [];
        var data_pointer = 0;
        var target = ele;
        var original_target = target;
        var children = target.childNodes, child = null, i=0;
        var chain = [];
        var p = target.parentNode;
        const 
        ID = 0, 
        TYPE = 1, 
        NAME = 2, 
        NAMESPACE = 3, 
        VALUE = 4, 
        DEPTH = 5, 
        ATTRS = 6, 
        CHILDREN_LENGTH = 7, 
        IS_TARGET = 8, 
        IS_LAST = 9;
        var readNode = function(node, pointer, level, is_last)
        {
          var children = node.childNodes, 
          children_length = children.length,  
          child = null, 
          i = 0,
          attrs = node.attributes, 
          attr = null, 
          j = 0, 
          s_attr = '';
          data[ data_pointer + ID ] = node;
          data[ data_pointer + TYPE ] = node.nodeType;
          data[ data_pointer + NAME ] = node.nodeName;
          data[ data_pointer + NAMESPACE ] = node.namespaceURI || 'null';
          data[ data_pointer + VALUE ] = ( node.nodeValue || '' ).replace(/\u003C/g, '&lt;');
          data[ data_pointer + DEPTH ] = level;
          if( attrs )
          {
            for( ; attr = attrs[j]; j++)
            {
              s_attr += ( s_attr ? ',' : '' ) + 
                '"' + attr.name + '":' +
                '"' + attr.value.replace(/"/g, '\\"') + '"';
            };
          };
          data[ data_pointer + ATTRS ] = s_attr;
          data[ data_pointer + CHILDREN_LENGTH ] = children_length;
          data[ data_pointer + IS_TARGET ] = node == original_target ? 1 : 0;
          data[ data_pointer + IS_LAST ] = is_last ? 1 : 0;
          data_pointer += 10;
          if( !level )
          {
            readDoctype();
          };
          if( node == chain[pointer] )
          { 
            for( i=0; child = children[i]; i++ )
            {
              readNode(child, pointer+1, level+1, i == children_length - 1);
            };
          }
          if( children_length == 1 && node.firstChild.nodeType == 3 )
          {
            readNode(node.firstChild, pointer+1, level+1, true);
          }
        };
        do
        {
          chain.unshift(p);
        }
        while( p = p.parentNode );
        var readDoctype = function()
        {
          if( document.firstChild && document.doctype && document.firstChild.nodeType != 10 )
          {

            data[ data_pointer + ID ] = document.doctype;
            data[ data_pointer + TYPE ] = document.doctype.nodeType;
            data[ data_pointer + NAME ] = document.doctype.nodeName;
            data[ data_pointer + NAMESPACE ] = '';
            data[ data_pointer + VALUE ] = '';
            data[ data_pointer + DEPTH ] = 1;
            data[ data_pointer + ATTRS ] = '"publicId":"' + document.doctype.publicId +
              '","systemId":"'+document.doctype.systemId +'"';
            data[ data_pointer + CHILDREN_LENGTH ] = 0;
            data[ data_pointer + IS_TARGET ] = 0;
            data[ data_pointer + IS_LAST ] = 0;
            data_pointer += 10;
          }
        }
        readNode(chain[0], 0, 0, true);
        return data;
      },
      function(node) 
      {
        var data = [];
        var data_pointer = 0;
        const 
        ID = 0, 
        TYPE = 1, 
        NAME = 2, 
        NAMESPACE = 3, 
        VALUE = 4, 
        DEPTH = 5, 
        ATTRS = 6, 
        CHILDREN_LENGTH = 7, 
        IS_TARGET = 8, 
        IS_LAST = 9;
        var readNode = function(node, level, is_last)
        {
          var children = node.childNodes, children_length = children.length;
          var attrs = node.attributes, attr = null, j = 0, s_attr = '';
          data[ data_pointer + ID ] = id;
          data[ data_pointer + TYPE ] = node.nodeType;
          data[ data_pointer + NAME ] = node.nodeName;
          data[ data_pointer + NAMESPACE ] = node.namespaceURI;
          data[ data_pointer + VALUE ] = ( node.nodeValue || '' ).replace(/\u003C/g, '&lt;');
          data[ data_pointer + DEPTH ] = level;
          if( attrs )
          {
            for( ; attr = attrs[j]; j++)
            {
              s_attr += ( s_attr ? ',' : '' ) + '\u0022' + attr.name + '\u0022:'+
                '\u0022' + attr.value.replace(/\u0022/g, '\\\\u0022') + '\u0022';
            };
          };
          data[ data_pointer + ATTRS ] = s_attr;
          data[ data_pointer + CHILDREN_LENGTH ] = children_length;
          data[ data_pointer + IS_TARGET ] = 0;
          data[ data_pointer + IS_LAST ] = is_last ? 1 : 0;
          data_pointer += 10;
          if( children_length == 1 && node.firstChild.nodeType == 3 )
          {
            readNode(node.firstChild, level+1, true);
          }
        };
        var children = node.childNodes, children_length = children.length,  child = null, i = 0;
        for( ; child = children[i]; i++ ) 
        {
           readNode(child, 1, i == children_length - 1);
        };
        return data;
      }
    ];
  }

  var initRuntime_hostside_to_string = initRuntime_hostside.toString().replace(/&/g, '&amp;');

  // returned value is a an object-id, 
  var handleInitRuntimeCall = function(xml, runtime_id)
  {
    if(xml.getNodeData('status') == 'completed' )
    {
     var tag = tagManager.setCB(null, initRuntime, [runtime_id]);
     commands.examineObjects(tag, runtime_id, xml.getNodeData('object-id'))
    }
    else
    {
      opera.postError('initialization from runtime in dom_data has failed');
    }
  }

  var initRuntime = function(xml, runtime_id )
  {
    var items = xml.getElementsByTagName('object-id');
    if( items.length == 5 )
    {
      //items[0] is the id of the returned array
      initializedRuntimes[items[1].textContent] =
      {
        document_id: items[2].textContent,
        getTreeWithTarget: items[3].textContent,
        getCildren: items[4].textContent,
      }
    }
  }

  var onActiveTab = function(msg)
  {
    // TODO clean up old tab
    data = []; // this must be split for all runtimes in the active tab
    var tab = msg.activeTab, rt_id = '', i = 0, tag = 0;
    for( ; rt_id = tab[i]; i++)
    {
      tag = tagManager.setCB(null, handleInitRuntimeCall, [ rt_id ]);
      commands.eval
      (
        tag, 
        rt_id, '', '', 
        '(' + initRuntime_hostside_to_string +')(' + '$' + rt_id + ')', ['$' + rt_id, rt_id]
       );
    }
  }

  var clickHandlerHost = function(event)
  {
    var rt_id = event['runtime-id'], obj_id = event['object-id']
    var init_rt_id = initializedRuntimes[rt_id];
    if( init_rt_id  )
    {
      data = [];
      tag = tagManager.setCB(null, handleGetTree, [ rt_id ]);
      commands.eval
      (
        tag, 
        rt_id, '', '', 
        '$' + init_rt_id.getTreeWithTarget + '($' + obj_id  + ')',  ['$' + init_rt_id.getTreeWithTarget, init_rt_id.getTreeWithTarget, '$' + obj_id, obj_id]
       );
     
    }


    //alert('clickHandlerHost: '+event['runtime-id']+' '+event['object-id'])
  }

  var handleGetTree = function(xml, runtime_id)
  {
    if(xml.getNodeData('status') == 'completed' )
    {
     var tag = tagManager.setCB(null, getTree, [runtime_id]);
     commands.examineObjects(tag, runtime_id, xml.getNodeData('object-id'))
    }
    else
    {
      opera.postError('handleGetTree in dom_data has failed');
    }
    
  }

  var getTree = function(xml, runtime_id)
  {
    data = [];
    data.runtime_id = runtime_id;
    var objects = xml.getElementsByTagName('object-id'), object = null;
    var strings = xml.getElementsByTagName('string');
    var i = 0, j = 1, k = 0;
    for( ; object = objects[j]; j++)
    {
      data[i + ID] = object.textContent; 
      data[i + TYPE] = parseInt(strings[k + TYPE].textContent);
      data[i + NAME] = strings[k + NAME].textContent;
      data[i + NAMESPACE] = strings[k + NAMESPACE].textContent;
      data[i + VALUE] = strings[k + VALUE].textContent;
      data[i + DEPTH] = parseInt(strings[k + DEPTH].textContent);
      data[i + ATTRS] = eval( "({" + strings[k + ATTRS].textContent + "})" );
      data[i + CHILDREN_LENGTH] = parseInt(strings[k + CHILDREN_LENGTH].textContent);
      data[i + IS_TARGET] = parseInt(strings[k + IS_TARGET].textContent);
      data[i + IS_LAST] = parseInt(strings[k + IS_TARGET].textContent);
      k += 9;
      i += 10;
    }
    //opera.postError(data)
    views['dom-inspector'].update();
  }

  var onShowView = function(msg)
  {
    if(msg.id == view_id )
    {
      if( !data.length )
      {
        tabs.activeTab.addEventListener('click', clickHandlerHost);
        var tab = tabs.getActiveTab(), rt_id = '', i = 0, tag = 0;
        var init_rt_id = null;
        for( ; rt_id = tab[i]; i++)
        {
          if( init_rt_id = initializedRuntimes[rt_id] )
          {
            tag = tagManager.setCB(null, handleGetTree, [ rt_id ]);
            commands.eval
            (
              tag, 
              rt_id, '', '', 
              '$' + init_rt_id.getTreeWithTarget + '($' + init_rt_id.document_id  + '.body)',  ['$' + init_rt_id.getTreeWithTarget, init_rt_id.getTreeWithTarget, '$' + init_rt_id.document_id, init_rt_id.document_id]
             );
           
          }
          else
          {
            opera.postError('missing initialized runtime in onShowView in dom_data');
          }
        }
      }
    }
  }

  var onHideView = function(msg)
  {
    
  }

  this.getData = function()
  {
    return data.slice(0);
  }

  this.getChildernFromNode = function(runtime_id, object_id)
  {
    alert('we are working on this one');
  }
  
  messages.addListener('active-tab', onActiveTab);
  messages.addListener('show-view', onShowView);
  messages.addListener('hide-view', onHideView);

}