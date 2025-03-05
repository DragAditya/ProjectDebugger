URL: https://21st.dev/preetsuthar17/typewriter-text/default
---
[H](https://21st.dev/hextaui)

Typewriter Text

[H](https://21st.dev/hextaui)

Default

17

CodeInfo

Copy prompt

Sandbox - CodeSandbox

\[3/3\] Starting

Install component

npm

`npxshadcn@latest add "https://21st.dev/r/preetsuthar17/typewriter-text"`

Copy Code `Ctrl+C`

demo.tsxtypewriter-text.tsx

import{Typewriter}from"@/components/ui/typewriter-text"

constDemoVariant1 = ()=>{

return(

<>

<Typewriter

text={\["Welcome to HextaUI","Build awesome websites.","hextaui.com"\]}

speed={100}

loop={true}

className="text-xl font-medium"

/>

</>

)

}

export{DemoVariant1}