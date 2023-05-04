import './App.css';
import { Tools } from './Tools';
import React, {useEffect, useState} from "react";
import {Canvas} from "./Canvas";

export const LabelContext = React.createContext({});

function App() {

    const [images, setImages] = useState([]);
    const [image, setImage] = useState();
    const [labels, setLabels] = useState([]);

    const [activeSelect, setActiveSelect] = useState(false);
    const [activeCreateLabel, setActiveCreateLabel] = useState(false);

    const onResponse = async (result) => {
        await result;
        setImages(result);
    };

    const handleOnImageClick = (url) => {
        setImage(url);
    };

    useEffect(() => {
        fetch('https://jsonplaceholder.typicode.com/photos')
            .then(response => response.json().then(onResponse))
            .then(json => console.log(json));
    }, []);

  return (
    <div className="App">
        <header className="App-header">
            <span>Dataset Label</span>
        </header>
        <LabelContext.Provider
            value={{
                labels,
                setLabels,
                activeCreateLabel,
                setActiveCreateLabel,
                activeSelect,
                setActiveSelect,
                image,
            }}>
            <main className="App-main">
                <Tools />
                <Canvas />
            </main>
        </LabelContext.Provider>
        { image === undefined && (
        <div className="App-img-modal">
            {images.map(image => {
                return (
                    <div key={image.id}>
                        <img src={image.thumbnailUrl}
                             width="70px" height="70px" alt={image.title}
                             onClick={() => handleOnImageClick(image.url)} />
                    </div>
                )
            })}
        </div>)}
    </div>
  );
}

export default App;
