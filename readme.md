2018-04-24 This is a demo to show how use this utility to inherited a ExtJS class in typeScript like that:

```
    @ts.extjs
    class myForm extends Ext.window.Window 
    {
       constructor() {
          super();
       }
    
       initComponent() {
          super.initComponent();
          ...
       }
    }
    
    let aForm = new myForm();
```

Basically I already done it, but since I am not sure how to make files work in your environment, so I just show you the codes, and will make it better later.

There are 3 files: 
- index.html
- main.ts
- ts-decorators-extjs.ts

## index.html
```
<!DOCTYPE html>
<html>
    <head>
<meta charset="UTF-8">
    <link   href="../../javascript.dev/library/extjs-6.2.0/build/classic/theme-triton/resources/theme-triton-all.css" rel="stylesheet" />
        <script src="../../javascript.dev/library/extjs-6.2.0/build/ext-all-debug.js"></script>
        <script src="../../javascript.dev/library/extjs-6.2.0/build/classic/theme-triton/theme-triton.js"></script>
    </head>
    <body>
       <script src="../../javascript.dev/library/requirejs-2.3.5/require.js"></script>
       <script>
           require(["./main"]);
       </script>
</html>
```

## main.ts
```
'use strict';

import * as ts from './ts-decorators-extjs';

let xxx = 400;
let yyy = 40;

@ts.extjs('Ext.window.Window')
class TCustomTestForm extends Ext.window.Window {
   static configParameters : Object = {
      title   : 'TCustomTestForm',
      x       : 40,
      y       : 40,
      width   : 300,
      height  : 300
   }   
}


@ts.extjs ( ts.EXT_CLASS_DEFAULT_NAMESPACE+'TCustomTestForm', 'ExtDummy')
class TTestForm extends TCustomTestForm { 
   constructor() {
      super();
      this.title = 'TTestForm';
      this.width = 200;
      this.height = 200;
      this.x = xxx;
      this.y = yyy;
      this.setPosition ( xxx, yyy, true);
      xxx = xxx + 50;
      yyy = yyy + 50;
  }
}
      
declare class TTestFormExt extends TTestForm {}

function test_ClassInheritedFromExtJs()
{
   // form of TTestForm
   function test_TCustomTestForm() // create a extjs window (declared as typescript class) by new.
   {
      var aForm = new TCustomTestForm();
      aForm.show();
   }
   
   // form of TTestForm
   function test_TTestForm() // create a extjs window (declared as typescript class) by new.
   {
      var aForm = new TTestForm();
      aForm.show();
   }
   
   // inherited from TTestForm
   function test_a() // create a extjs window (declared as typescript class) by Ext.Create
   {
      var bForm : TTestForm = Ext.create ( //EXT_CLASS_DEFAULT_NAMESPACE+'ExtDummy.TTestForm'
                                           (TTestForm.prototype as any).$className
                                          ) as TTestForm;
      bForm.show();
   }
   
   // inherited from TTestForm
   function test_b() // inherite & create a extjs window(declared as typescript class) by Ext.define & Ext.create
   {
      Ext.define  ( ts.EXT_CLASS_DEFAULT_NAMESPACE+'TTestFormExt', { extend: //EXT_CLASS_DEFAULT_NAMESPACE+'ExtDummy.TTestForm', 
                                                                            (TCustomTestForm.prototype as any).$className,
                                                                     x: 40+40, 
                                                                     y: 40+40, 
                                                                     height: 250,
                                                                     title: 'hello again'
                                                                   }
                  );
      var cForm : TTestFormExt = Ext.create ( ts.EXT_CLASS_DEFAULT_NAMESPACE+'TTestFormExt') as TTestFormExt;
      cForm.show();
   }
   
   test_TCustomTestForm();
   test_TTestForm();
   test_a();
   test_b();
}

function main() 
{   
   test_ClassInheritedFromExtJs();
}

Ext.onReady(main);
```

## ts-decorators-extjs.ts
```
'use strict';  

const EXT_CLASS_DEFAULT_NAMESPACE  : string = ''; 
const _METHODNAME_CONFIGPARAMETERS : string = 'configParameters'; // don't try to use '$config', will get 
                                                                  // error: Maximum call stack size exceeded
function assert (aCondition: boolean, aMessage: string) 
{ 
    if (!aCondition)
    {
        let longMessage = "Assert failed" + (typeof aMessage !== "undefined" ? ": " + aMessage : "");
        alert ( longMessage);
    }
};
                                                               
function copyOwnProperities ( target: any, source: any) : void
{ 
   for (let aProperty in source) 
      if (source.hasOwnProperty(aProperty)) 
      {
         target[aProperty] = source[aProperty]; 
      } 
};
                                                                  
function parentClassOfClass ( aClass: any): any {
   return (Object.getPrototypeOf(aClass.prototype));
}
                                                                 
function isExtClass ( aClass: any): boolean {
   return (aClass.hasOwnProperty('$className'));
}
                                                                  
function getParentClassName ( aClass: any): string {
   let result : string = '';
   let aParentClass : any = parentClassOfClass(aClass);
   if (isExtClass(aParentClass)==true)
      result = aParentClass.$className 
   else
   {
      result  = aParentClass.constructor.name; // typescript class
   }
   return result;
}
                                                                  
function getReEntry ( this: void, self: any): number
{
   if (typeof self['reEntry']!=='number')
      return -1
   else 
      return self.reEntry;
}
                                                                  
function setReEntry ( this: void, self: any, aValue: number, aDescription?: string): void
{
   if (aValue!=-1)
      self.reEntry = aValue
   else
      if (typeof self['reEntry']=='number')
         delete self.reEntry;
}
                                                                 
function extjs(expectedParentClassName: string, aNameSpaceName?: string)
{
   return function (aCurrentClass: any) {
      assert ( isExtClass(parentClassOfClass(aCurrentClass)), 'class must inherited by Ext Class!')
      let aParentClassName : string = getParentClassName(aCurrentClass);
      /// 2018-04-21 notice that the expectedParentClassName in a minified javascript will 
      ///            be changed so the following comparation will be wrong. 
      assert ( aParentClassName===expectedParentClassName, 'ERROR ERROR ERROR');

      let aConfig : any = { extend: aParentClassName
                          };
      if (typeof(aCurrentClass[_METHODNAME_CONFIGPARAMETERS])==='object')
      {
         aConfig = Ext.Object.merge ( aConfig, aCurrentClass[_METHODNAME_CONFIGPARAMETERS]);
         delete aCurrentClass[_METHODNAME_CONFIGPARAMETERS];
      }

      let aExtClassName : string = (aNameSpaceName?aNameSpaceName+'.':EXT_CLASS_DEFAULT_NAMESPACE) + aCurrentClass.name;
      let TExtClass     : any    = Ext.define ( aExtClassName, aConfig);
      assert ( isExtClass(parentClassOfClass(TExtClass)), 'error inherited from a non-Ext class');

      copyOwnProperities ( TExtClass.prototype, aCurrentClass.prototype);
      
      function getExtClassName(): string {
         return aExtClassName;
      }
      (TExtClass.prototype as any).typeScript_Constructor = aCurrentClass.prototype.constructor;

      TExtClass.prototype.constructor = function( this: any) { 
         function callSuperConstructor(this: void, self: any, ...args: any[]): void {
            TExtClass.superclass.constructor.apply ( self, args);
         }

         function callTypeScriptConstructor_IgnoreSuper(this: void, self: any, ...args: any[]): void {
            setReEntry(self, 1, 'In prototype.constructor');
            try {
               TExtClass.prototype.typeScript_Constructor.apply(self, args); 
            }
            finally {
               setReEntry ( self, -1, 'In prototype.constructor');
            }
         }

         let reEntrying : boolean = getReEntry(this)==1;
         if (!reEntrying)   // don't do anything if reentry
         {
            callSuperConstructor(this, arguments);
            callTypeScriptConstructor_IgnoreSuper(this, arguments);
         }
      }

      let classConstructor : any = function (this: any, ...args: any[]) 
      {
         let reEntrying : boolean = getReEntry(this)==1;
         try {
            if (!reEntrying)
            {
               let result = Ext.create(getExtClassName()); 
               return result;
            }
            else
            {
               return this;
            }
         }
         finally {
         }
      }
      classConstructor.prototype = TExtClass.prototype;
      return classConstructor; 
   }
}

export {extjs, EXT_CLASS_DEFAULT_NAMESPACE}
```
