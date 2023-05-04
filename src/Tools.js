import select from "./img/Select.svg";
import createLabel from "./img/CreateLabel.svg";
import {useContext, useState} from "react";
import {LabelContext} from "./App";

export const Tools = () => {

    const { activeSelect, setActiveSelect, activeCreateLabel, setActiveCreateLabel } = useContext(LabelContext);

    const handleOnClick = (behavior) => {
        if( behavior === 'createLabel' ){
            setActiveCreateLabel(!activeCreateLabel);
            setActiveSelect(false);
        }

        if( behavior === 'select' ){
            setActiveSelect(!activeSelect);
            setActiveCreateLabel(false);
        }
    };

    return (<div className="App-tools">
        <div className={activeSelect ? 'Button-active' : ''}
             onClick={() => handleOnClick('select')}>
            <img src={select} alt="선택 버튼"
            />
        </div>
        <div className={activeCreateLabel ? 'Button-active' : ''}
             onClick={() => handleOnClick('createLabel')}>
            <img src={createLabel} alt="라벨생성 버튼"
            />
        </div>
    </div>);
}