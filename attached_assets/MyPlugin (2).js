import React from "react";


/* Don't forget to download the CSS file too */
import "./style.css";

export const MyPlugin = () => {
  return (
    <div id="webcrumbs"> 
            	<div className="w-[1200px] rounded-xl bg-white shadow-lg p-8">
    	    <nav className="flex items-center justify-between mb-8">
    	        <h1 className="text-2xl font-semibold">Code Debugger</h1>
    	        <div className="flex items-center gap-4">
    	            <details className="relative">
    	                <summary className="flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 hover:bg-gray-100 transition-all">
    	                    <span className="material-symbols-outlined">account_circle</span>
    	                    <span>Account</span>
    	                </summary>
    	                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-xl py-2">
    	                    <a className="block px-4 py-2 hover:bg-gray-100" href="#">
    	                        Profile
    	                    </a>
    	                    <a className="block px-4 py-2 hover:bg-gray-100" href="#">
    	                        Settings
    	                    </a>
    	                    <a className="block px-4 py-2 hover:bg-gray-100" href="#">
    	                        Logout
    	                    </a>
    	                </div>
    	            </details>
    	            <button className="p-2 rounded-full hover:bg-gray-100 transition-all">
    	                <span className="material-symbols-outlined">light_mode</span>
    	            </button>
    	        </div>
    	    </nav>
    	
    	    <div className="grid grid-cols-2 gap-8">
    	        <div className="space-y-4">
    	            <details className="relative mb-4">
    	                <summary className="flex items-center gap-2 cursor-pointer rounded-lg px-4 py-2 border hover:bg-gray-50 transition-all">
    	                    <span className="material-symbols-outlined">code</span>
    	                    <span>Select Language</span>
    	                </summary>
    	                <div className="absolute left-0 mt-2 w-48 rounded-lg bg-white shadow-xl py-2">
    	                    <a className="block px-4 py-2 hover:bg-gray-100" href="#">
    	                        Python
    	                    </a>
    	                    <a className="block px-4 py-2 hover:bg-gray-100" href="#">
    	                        JavaScript
    	                    </a>
    	                    <a className="block px-4 py-2 hover:bg-gray-100" href="#">
    	                        Java
    	                    </a>
    	                    <a className="block px-4 py-2 hover:bg-gray-100" href="#">
    	                        C++
    	                    </a>
    	                </div>
    	            </details>
    	            <div className="h-[400px] rounded-xl border bg-gray-50 p-4"></div>
    	            <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-3 hover:bg-blue-700 transform hover:scale-[1.02] transition-all">
    	                <span className="material-symbols-outlined">bug_report</span>
    	                Debug Code
    	            </button>
    	        </div>
    	
    	        <div className="space-y-4">
    	            <h2 className="text-xl font-semibold">Debug Results</h2>
    	            <div className="h-[400px] rounded-xl border bg-gray-50 p-4"></div>
    	            <div className="rounded-xl border p-4 space-y-2">
    	                <h3 className="font-medium">Explanation</h3>
    	                <p className="text-gray-600">The AI will provide an explanation of the fixes here...</p>
    	            </div>
    	        </div>
    	    </div>
    	
    	    <footer className="mt-8 pt-8 border-t">
    	        <div className="flex items-center justify-between text-sm text-gray-500">
    	            <span>Powered by Gemini API | Made By DragAdi</span>
    	            <div className="flex items-center gap-4">
    	                <a className="hover:underline" href="#">
    	                    Documentation
    	                </a>
    	                <a className="hover:underline" href="#">
    	                    API Reference
    	                </a>
    	                <a className="hover:underline" href="#">
    	                    Support
    	                </a>
    	            </div>
    	        </div>
    	    </footer>
    	</div> 
            </div>
  )
}

