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

This project still have something will be changed later, but need some more time.

There are 3 files: 
- index.html
- main.ts
- ts-decorators-extjs.ts

