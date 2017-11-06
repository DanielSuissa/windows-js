# windows-js
A concept library for making your website take next step in becoming a desktop application like

![Example : Single Screen, Single Focus Desktop App](https://raw.githubusercontent.com/DanielSuissa/windows-js/master/images/single_screen.PNG)

## This is still a work in progress

1. Arrange your information within natural behaving Windows
```
<app-window caption="my content">
    <app-window-body border="yes" bordercolor="white" bgcolor="transparent" scroll="auto">
        <!-- Your Content Here -->
    </app-window-body>
</app-window>
```

2. Group related topics by creating Tabs
```
<app-window caption="exprerimental tabs">
    <tabs-controller>
        <tab-controller name="settingsTab" caption="settings">
            <!-- content #1 -->
        </tab-controller>
        <tab-controller name="activationTab" caption="activation">
            <!-- content #2 -->
        </tab-controller>
        <tab-controller name="tableTab" caption="table">
            <!-- content #3 -->
        </tab-controller>
    </tabs-controller>
</app-window>
```

3. Change entire appearance using css

4. Use multiscreen-option while enabling users to smoothly drag windows from one chrome page to another.
Try activating:
```
Application.screeensApi.extend()
```
Then put both windows side by side,
now drag :)

You can now extend to whatever number of screens you like.


![Example : Double Screen Desktop App](https://raw.githubusercontent.com/DanielSuissa/windows-js/master/images/multiscreen1.png)
![Example : Double Screen Desktop App](https://raw.githubusercontent.com/DanielSuissa/windows-js/master/images/multiscreen2.png)
