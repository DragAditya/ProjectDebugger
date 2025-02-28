
import { useTheme } from "@/components/theme-provider";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const StyledWrapper = styled.div`
  /* Scale down by 25% */
  transform: scale(0.75);
  transform-origin: center;
  
  .switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 34px;
  }

  .switch #input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #2196f3;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    z-index: 0;
    overflow: hidden;
  }

  .sun-moon {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
    border-radius: 50%;
    z-index: 0;
  }

  #cloud-1 {
    position: absolute;
    z-index: 3;
    translate: -135% 30%;
    width: 10px;
    height: 10px;
  }

  #cloud-2 {
    position: absolute;
    z-index: 3;
    translate: -80% 10%;
    width: 10px;
    height: 10px;
  }

  #cloud-3 {
    position: absolute;
    z-index: 3;
    translate: -40% 40%;
    width: 10px;
    height: 10px;
  }

  #cloud-4 {
    position: absolute;
    z-index: 3;
    translate: -120% 30%;
    width: 10px;
    height: 10px;
  }

  #cloud-5 {
    position: absolute;
    z-index: 3;
    translate: -80% 10%;
    width: 10px;
    height: 10px;
  }

  #cloud-6 {
    position: absolute;
    z-index: 3;
    translate: -40% 30%;
    width: 10px;
    height: 10px;
  }

  .star {
    position: absolute;
    z-index: 1;
    width: 5px;
    height: 5px;
  }

  #star-1 {
    translate: -700% 550%;
    scale: 0.9;
  }

  #star-2 {
    translate: -500% 300%;
    scale: 0.9;
  }

  #star-3 {
    translate: -300% 200%;
    scale: 0.9;
  }

  #star-4 {
    translate: -150% 250%;
    scale: 0.9;
  }

  .moon-dot {
    position: absolute;
    z-index: 3;
    width: 5px;
    height: 5px;
  }

  #moon-dot-1 {
    translate: 30% 30%;
  }

  #moon-dot-2 {
    translate: 40% 70%;
  }

  #moon-dot-3 {
    translate: 70% 40%;
  }

  .light-ray {
    position: absolute;
    z-index: 1;
    width: 6px;
    height: 6px;
  }

  #light-ray-1 {
    translate: -60% 15%;
  }

  #light-ray-2 {
    translate: -40% -60%;
  }

  #light-ray-3 {
    translate: 15% -60%;
  }

  .cloud-dark {
    fill: white;
  }

  .cloud-light {
    fill: rgba(0, 0, 0, 0);
    stroke: white;
    stroke-width: 8px;
  }

  input:checked + .slider {
    background-color: #485a88;
  }

  input:checked + .slider .light-ray {
    fill: rgba(0, 0, 0, 0);
  }

  input:checked + .slider .stars {
    fill: white;
  }

  input:checked + .slider .moon-dot {
    fill: #e6e6e6;
  }

  input:checked + .slider .sun-moon {
    translate: 26px 0px;
    background-color: #e6e6e6;
  }

  input:focus + .slider {
    box-shadow: 0 0 1px #686868;
  }

  .stars {
    fill: rgba(0, 0, 0, 0);
  }

  .round {
    border-radius: 34px;
  }

  .round .sun-moon {
    border-radius: 50%;
  }
`;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [checked, setChecked] = useState(theme === "dark");

  useEffect(() => {
    setChecked(theme === "dark");
  }, [theme]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(e.target.checked ? "dark" : "light");
  };

  return (
    <div className="switch-wrapper">
      <label className="switch">
        <input 
          id="input" 
          type="checkbox" 
          checked={checked}
          onChange={handleChange}
        />
        <div className="slider round">
          <div className="sun-moon">
            <svg id="moon-dot-1" className="moon-dot" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="moon-dot-2" className="moon-dot" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="moon-dot-3" className="moon-dot" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="light-ray-1" className="light-ray" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="light-ray-2" className="light-ray" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="light-ray-3" className="light-ray" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-1" className="cloud-dark" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-2" className="cloud-dark" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-3" className="cloud-dark" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-4" className="cloud-light" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-5" className="cloud-light" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-6" className="cloud-light" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
          </div>
          <div className="stars">
            <svg id="star-1" className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg id="star-2" className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg id="star-3" className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg id="star-4" className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
          </div>
        </div>
      </label>
      return (
    <StyledWrapper>
      <label className="switch">
        <input 
          id="input" 
          type="checkbox" 
          checked={checked} 
          onChange={handleChange} 
        />
        <div className="slider round">
          <div className="sun-moon">
            <svg id="moon-dot-1" className="moon-dot" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="moon-dot-2" className="moon-dot" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="moon-dot-3" className="moon-dot" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="light-ray-1" className="light-ray" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="light-ray-2" className="light-ray" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="light-ray-3" className="light-ray" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-1" className="cloud-dark" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-2" className="cloud-dark" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-3" className="cloud-dark" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-4" className="cloud-light" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-5" className="cloud-light" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
            <svg id="cloud-6" className="cloud-light" viewBox="0 0 100 100">
              <circle cx={50} cy={50} r={50} />
            </svg>
          </div>
          <div className="stars">
            <svg id="star-1" className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg id="star-2" className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg id="star-3" className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
            <svg id="star-4" className="star" viewBox="0 0 20 20">
              <path d="M 0 10 C 10 10,10 10 ,0 10 C 10 10 , 10 10 , 10 20 C 10 10 , 10 10 , 20 10 C 10 10 , 10 10 , 10 0 C 10 10,10 10 ,0 10 Z" />
            </svg>
          </div>
        </div>
      </label>
      <span className="sr-only">Toggle theme</span>
    </StyledWrapper>
  );
}
