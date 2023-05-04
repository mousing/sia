import {useContext, useEffect, useRef} from "react";
import {LabelContext} from "./App";

const LABEL_WIDTH = 140;
const LABEL_HEIGHT = 140;
const LABEL_STROKE = '#6F7DFF';
const LABEL_STROKE_WIDTH = 2;
const LABEL_FILL = 'rgba(111, 125, 255, 0.1)';
const ANCHOR_STROKE = '#373A55';
const ANCHOR_FILL = '#D9D9D9';

function makeAnchor(x, y, width, height) {
    let i = 0;
    let anchor = [];

    while( i < 9 ){
        if( i === 4 ) {
            i++;
            continue;
        }

        const xx = i % 3;
        const yy = Math.floor(i / 3);

        anchor.push({
            x: x + xx * width / 2,
            y: y + yy * height / 2,
            width: 8,
            height: 8,
        });

        i++;
    }

    return anchor;
};

function Label(x, y, selected){
    this.x = x;
    this.y = y;
    this.width = LABEL_WIDTH;
    this.height = LABEL_HEIGHT;
    this.marginX = 0;
    this.marginY =  0;
    this.selected = selected || false;
    this.current = false;
    this.dragAnchor = false;

    this.anchor = makeAnchor(x, y, this.width, this.height);

    this.move = (dx, dy) => {
        this.x = this.x + dx;
        this.y = this.y + dy;

        this.anchor = makeAnchor(this.x, this.y, this.width, this.height);
    };

    this.resize = (dx, dy, anchorIndex) => {
        const idx = anchorIndex > 3 ? anchorIndex+1:anchorIndex;
        const isVertex = idx % 2 === 0;

        const correctDx = dx - this.anchor[anchorIndex].x;
        const correctDy = dy - this.anchor[anchorIndex].y;

        if( isVertex ){
            switch (idx){
                case 0:
                    this.width = this.width - correctDx;
                    this.height = this.height - correctDy;
                    this.x = this.x + correctDx;
                    this.y = this.y + correctDy;
                    break;
                case 2:
                    this.width = this.width + correctDx;
                    this.height = this.height - correctDy;
                    this.y = this.y + correctDy;
                    break;
                case 8:
                    this.width = this.width + correctDx;
                    this.height = this.height + correctDy;
                    break;
                case 6:
                    this.width = this.width - correctDx;
                    this.height = this.height + correctDy;
                    this.x = this.x + correctDx;
                default:
            }
        }else{
            switch (idx){
                case 1:
                    this.height = this.height - correctDy;
                    this.y = this.y + correctDy
                    break;
                case 5:
                    this.width = this.width + correctDx;
                    break;
                case 7:
                    this.height = this.height + correctDy;
                    break;
                case 3:
                    this.width = this.width - correctDx;
                    this.x = this.x + correctDx;
                    break;
                default:
            }
        }

        // this.width = this.width + absDx;
        // this.height = this.height + (isVertex ? absDy : 0);

        this.anchor = makeAnchor(this.x, this.y, this.width, this.height);
    };

    this.isDownAnchorArea = (x, y) => {
        let isDown = false;
        let index = 0;

        this.anchor.forEach((value, i) => {
            if( x >= value.x - value.width/2 && x <= value.x + value.width/2
                && y >= value.y - value.height/2 && y <= value.y + value.height/2 ){
                isDown = true;
                index = i;
            }
        });

        return { isDown, index };
    };
}

export const Canvas = () => {

    const { image, labels, setLabels, activeSelect, setActiveSelect, activeCreateLabel, setActiveCreateLabel } = useContext(LabelContext);

    const canvasRef = useRef(null);
    const canvasContextRef = useRef(null);
    const backCanvasContextRef = useRef(null);

    const mouseDownRef = useRef(false);
    let mx = 0 , my = 0;

    const correctCoordinate = (x, y) => {
        const winScrollTop = window.scrollY;
        const offsetLeft = canvasRef.current.offsetLeft;
        const offsetTop = canvasRef.current.offsetTop;

        return {x: x - offsetLeft, y: y - offsetTop + winScrollTop};
    };

    const getLabelElement = (x, y) => {
        let isInLabels = false;

        setLabels(labels.map(label => {
            if( x >= label.x && x <= (label.x + label.width)
                && y >= label.y && y <= (label.y + label.height)){
                label.selected = true;
                label.current = true;

                //마우시 다운시 커서의 라벨원점과의 거리
                label.marginX = x - label.x;
                label.marginY = y - label.y;
                isInLabels = true;
            }
            else{
                label.current = false;
            }

            const {isDown, index} = label.isDownAnchorArea(x, y);
            label.dragAnchor = isDown;
            label.dragAnchorIndex = index;

            return label;
        }));

        return isInLabels;
    };

    const handleMouseClick = (e) => {
        const {x, y} = correctCoordinate(e.clientX, e.clientY);

        const label = new Label(x, y, true);

        setLabels([...labels, label]);

        setActiveCreateLabel(false);
        setActiveSelect(true);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const {x, y} = correctCoordinate(e.clientX, e.clientY);

        mouseDownRef.current = getLabelElement(x, y);
    };

    const handleMouseUp = (e) => {
        const {x, y} = correctCoordinate(e.clientX, e.clientY);

        setLabels(labels.map(label => {
            if( label.dragAnchor ){
                label.resize(x, y, label.dragAnchorIndex);
            }

            return label;
        }));

        mouseDownRef.current = false;
    };

    const handleMouseMove = (e) => {
        e.preventDefault();

        if( !mouseDownRef.current ) return;

        //마우스 현재 좌표
        const {x, y} = correctCoordinate(e.clientX, e.clientY);

        setLabels(labels.map(label => {
            if( !label.selected ) return label;
            if( label.dragAnchor ) return label;

            if( label.current ) {
                //이동 거리
                const dx = x - label.x;
                const dy = y - label.y;

                mx = dx - label.marginX;
                my = dy - label.marginY;

                label.move(mx, my);
            }else{
                label.move(mx, my);
            }

            return label;
        }));
    };

    const handleKeyup = (e) => {
        if( e.keyCode === 8 || e.keyCode === 46 ){
            setLabels(labels.filter(label => {
                return !label.selected;
            }));
            setActiveSelect(false);
        }
    };

    useEffect(() => {
        if( !canvasContextRef.current ) return;

        const ctx = canvasContextRef.current;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        labels.forEach(label => {
            ctx.strokeStyle = LABEL_STROKE
            ctx.lineWidth = LABEL_STROKE_WIDTH;
            ctx.fillStyle = LABEL_FILL;
            ctx.strokeRect(label.x, label.y, label.width, label.height)
            ctx.fillRect(label.x, label.y, label.width, label.height)

            if( label.selected ){
                ctx.strokeStyle = ANCHOR_STROKE;
                ctx.lineWidth = 1;
                ctx.fillStyle = ANCHOR_FILL;
                label.anchor.forEach(value => {
                   ctx.strokeRect(value.x - value.width/2, value.y - value.height/2, value.width, value.height);
                   ctx.fillRect(value.x - value.width/2, value.y - value.height/2, value.width, value.height);
                });

                ctx.beginPath();
                ctx.arc(label.x + label.width/2, label.y - 14, 4, 0, Math.PI * 2);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(label.x + label.width/2, label.y);
                ctx.lineTo(label.x + label.width/2, label.y - 14);
                ctx.stroke();

            }
        });
    }, [labels])

    useEffect(() => {
        if( !canvasRef.current ) return;
        
        const canvas = canvasRef.current;

        if( activeCreateLabel ){
            canvas.addEventListener('click', handleMouseClick);
        }else if( activeSelect ){
            canvas.addEventListener('mousedown', handleMouseDown);
            canvas.addEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('keydown', handleKeyup);
        }else{
            canvas.removeEventListener('click', handleMouseClick);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyup);
        }

        if( !activeSelect ){
            setLabels(labels.map(label => {
                label.selected = false;

                return label;
            }));
        }

        return () => {
            canvas.removeEventListener('click', handleMouseClick);
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.addEventListener('mouseup', handleMouseUp);
            window.removeEventListener('keydown', handleKeyup);
        };
    }, [activeCreateLabel, activeSelect]);

    useEffect(() => {
        const ctx = backCanvasContextRef.current;

        const img = new Image();
        img.src = image;
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
    }, [image]);

    useEffect(() => {
        const eleDiv = document.querySelector('.App-canvas-wrap');
        const eleCanvas = document.getElementById('canvas');
        const eleBackCanvas = document.getElementById('background-canvas');
        eleCanvas.width = eleBackCanvas.width = eleDiv.offsetWidth;
        eleCanvas.height = eleBackCanvas.height = eleDiv.offsetHeight;

        canvasRef.current = eleCanvas;
        backCanvasContextRef.current = eleBackCanvas.getContext('2d');
        canvasContextRef.current = eleCanvas.getContext('2d');

    }, []);

    return <div className="App-canvas-wrap">
        <canvas className="App-background-canvas" id="background-canvas">doesn't support canvas</canvas>
        <canvas className="App-main-canvas" id="canvas">doesn't support canvas</canvas>
    </div>
};