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