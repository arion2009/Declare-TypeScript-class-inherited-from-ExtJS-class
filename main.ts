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
