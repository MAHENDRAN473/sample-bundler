const fs = require('fs');
const path = require('path');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const babel = require('babel-core');

let ID = 0

function createAsset(filename){

    const content = fs.readFileSync(filename , 'utf-8');
    
    const ast = babylon.parse(content,{
        sourceType:'module'
    });

    const dependencies = [];

    traverse(ast, {
        ImportDeclaration: ({node}) => {
          dependencies.push(node.source.value);
        },
      });
 
     const {code}= babel.transformFromAst(ast,null,{presets:['env']});
      

      const id  = ID++;

      return {
        id,
        filename,
        dependencies,
        code,

      }


}


function createGraph(entry) {
    // Start by parsing the entry file.
    const mainAsset = createAsset(entry);

    const queue = [mainAsset];

    for (const asset of queue) {

      asset.mapping = {};
 
      const dirname = path.dirname(asset.filename);
  

      asset.dependencies.forEach(relativePath => {

        const absolutePath = path.join(dirname, relativePath);

        const child = createAsset(absolutePath);

        asset.mapping[relativePath] = child.id;
  
        queue.push(child);
      });
    }

    return queue;
  }

  function bundle(graph){
    let modules =''

    // IIFE function
    // const result = `(function() {

    // })({${modules}})`;

    graph.forEach(mod =>{mod =>{
        modules + `${mod.id}:[]`
    }})

    const result = `(function() {

    })({${modules}})`;

  }

  const graph = createGraph('./example/entry.js');
  console.log(graph);
