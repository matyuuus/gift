import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ScratchCard = () => {
  const [showGift, setShowGift] = useState(true);
  const [showBonus, setShowBonus] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [showBonusWinMessage, setShowBonusWinMessage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [activeCanvas, setActiveCanvas] = useState(null);
  
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const bonusCanvasRef = useRef(null);

  const CANVAS_WIDTH = 260;
  const MAIN_CANVAS_HEIGHT = 200;
  const NUMBERS_CANVAS_HEIGHT = 80;
  const BONUS_CANVAS_HEIGHT = 200;

  const gameData = [
    [
      { number: 15, prize: '10€' },
      { number: 7, prize: '15€' },
      { number: 4, prize: '5€' }
    ],
    [
      { number: 23, prize: '20€' },
      { number: 25, prize: '10€' },
      { number: 18, prize: '15€' }
    ],
    [
      { number: 16, prize: '5€' },
      { number: 14, prize: '20€' },
      { number: 22, prize: '10€' }
    ]
  ];

  const bonusSymbols = [
    '☕', '⛰️', '☕',
    '⏰', '☀️', '🌴',
    '⛰️', '☕', '☀️'
  ];

  const initializeCanvas = (canvas, height) => {
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const scale = window.devicePixelRatio;

    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${height}px`;
    canvas.width = CANVAS_WIDTH * scale;
    canvas.height = height * scale;

    context.scale(scale, scale);
    context.fillStyle = '#CCCCCC';
    context.fillRect(0, 0, CANVAS_WIDTH, height);
  };

  React.useEffect(() => {
    if (!showGift) {
      if (!showBonus) {
        setTimeout(() => {
          initializeCanvas(canvasRef1.current, MAIN_CANVAS_HEIGHT);
          initializeCanvas(canvasRef2.current, NUMBERS_CANVAS_HEIGHT);
        }, 100);
      } else {
        setTimeout(() => {
          initializeCanvas(bonusCanvasRef.current, BONUS_CANVAS_HEIGHT);
        }, 100);
      }
    }
  }, [showGift, showBonus]);

  const checkRevealProgress = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 127) transparent++;
    }

    const progress = transparent / (pixels.length / 4);

    if (canvas === canvasRef1.current && !showWinMessage && progress > 0.89) {
      setShowWinMessage(true);
    }

    if (canvas === bonusCanvasRef.current && !showBonusWinMessage && progress > 0.89) {
      setShowBonusWinMessage(true);
    }
  };

  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio;
    const x = ((e.clientX - rect.left) * (canvas.width / rect.width)) / scale;
    const y = ((e.clientY - rect.top) * (canvas.height / rect.height)) / scale;
    return { x, y };
  };

  const scratch = (e) => {
    if (!isDragging || !activeCanvas) return;

    const canvas = activeCanvas;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCoordinates(e, canvas);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';

    if (lastPosition) {
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setLastPosition({ x, y });
    checkRevealProgress(canvas);
  };

  const handleGiftClick = () => {
    setShowGift(false);
  };

  const handlePlayBonus = () => {
    setShowBonus(true);
    setShowWinMessage(false);
  };

  const renderCanvas = (canvasRef, height) => (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 z-10 cursor-pointer rounded"
      onMouseDown={(e) => {
        setIsDragging(true);
        setActiveCanvas(canvasRef.current);
        const { x, y } = getCoordinates(e, canvasRef.current);
        setLastPosition({ x, y });
      }}
      onMouseUp={() => {
        setIsDragging(false);
        setActiveCanvas(null);
        setLastPosition(null);
      }}
      onMouseLeave={() => {
        setIsDragging(false);
        setActiveCanvas(null);
        setLastPosition(null);
      }}
      onMouseMove={scratch}
      onTouchStart={(e) => {
        e.preventDefault();
        setIsDragging(true);
        setActiveCanvas(canvasRef.current);
        const touch = e.touches[0];
        const { x, y } = getCoordinates(touch, canvasRef.current);
        setLastPosition({ x, y });
      }}
      onTouchEnd={(e) => {
        e.preventDefault();
        setIsDragging(false);
        setActiveCanvas(null);
        setLastPosition(null);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        scratch(touch);
      }}
    />
  );

  if (showGift) {
    return (
      <Card className="max-w-sm mx-auto overflow-hidden">
        <div 
          onClick={handleGiftClick}
          className="cursor-pointer text-center p-6"
        >
          <h1 className="text-2xl font-bold mb-4 text-purple-600">
            Všetko najlepšie láska
          </h1>
          <div className="text-8xl mb-4">🎁</div>
          <p className="text-gray-600">Klikni na darček</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
        {!showBonus ? (
          <>
            <div className="text-center mb-12">
              <h2 className="text-xl font-bold text-white mb-3">Meninové čísla</h2>
              <p className="text-sm text-white/90">
                Nájdi číslo, ktoré sa zhoduje s tým tvojím a vyhraj uvedenú sumu
              </p>
            </div>

            <div className="flex flex-col items-center gap-12">
              <div className="w-full flex justify-center">
                <div className="relative" style={{ width: CANVAS_WIDTH }}>
                  <div className="absolute top-0 left-0 right-0 z-20 text-center -mt-6">
                    <h3 className="text-white/90 text-sm font-bold">Tvoje čísla</h3>
                  </div>
                  <div className="relative" style={{ width: CANVAS_WIDTH, height: NUMBERS_CANVAS_HEIGHT }}>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm text-white text-xl font-bold rounded">
                      <div className="flex space-x-12">
                        <span>4</span>
                        <span>30</span>
                        <span>11</span>
                        <span>9</span>
                      </div>
                    </div>
                    {renderCanvas(canvasRef2, NUMBERS_CANVAS_HEIGHT)}
                  </div>
                </div>
              </div>

              <div className="w-full flex justify-center">
                <div className="relative" style={{ width: CANVAS_WIDTH }}>
                  <div className="absolute top-0 left-0 right-0 z-20 text-center -mt-6">
                    <h3 className="text-white/90 text-sm font-bold">Hra</h3>
                  </div>
                  <div className="relative" style={{ width: CANVAS_WIDTH, height: MAIN_CANVAS_HEIGHT }}>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/10 backdrop-blur-sm text-white rounded py-4">
                      <div className="grid grid-cols-3 gap-6 w-full px-4">
                        {gameData.map((column, colIndex) => (
                          <div key={colIndex} className="flex flex-col items-center gap-6">
                            {column.map((item, rowIndex) => (
                              <div key={rowIndex} className="text-center">
                                <div className="text-lg font-bold">{item.number}</div>
                                <div className="text-sm">{item.prize}</div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    {renderCanvas(canvasRef1, MAIN_CANVAS_HEIGHT)}
                  </div>
                </div>
              </div>
            </div>

            {showWinMessage && (
              <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded z-20 p-4">
                <h3 className="text-xl font-bold mb-2">Gratulujem! 🎉</h3>
                <p className="text-center mb-4">Vyhral/a si 5€ v tejto lotérii!</p>
                <p className="text-center mb-4">Chceš si zahrať o bonus?</p>
                <Button 
                  onClick={handlePlayBonus}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Hrat!
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <p className="text-sm text-white/90 mb-12">
              Nájdi tri rovnaké symboly a vyhraj cenu, ktorá sa za nimi schováva
            </p>
            
            <div className="flex justify-center">
              <div className="relative" style={{ width: CANVAS_WIDTH }}>
                <div className="absolute top-0 left-0 right-0 z-20 text-center -mt-6">
                  <h3 className="text-white/90 text-sm font-bold">Bonus</h3>
                </div>
                <div className="relative" style={{ width: CANVAS_WIDTH, height: BONUS_CANVAS_HEIGHT }}>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-sm text-white rounded">
                    <div className="grid grid-cols-3 gap-6 p-4">
                      {bonusSymbols.map((symbol, index) => (
                        <div key={index} className="w-14 h-14 flex items-center justify-center text-3xl">
                          {symbol}
                        </div>
                      ))}
                    </div>
                  </div>
                  {renderCanvas(bonusCanvasRef, BONUS_CANVAS_HEIGHT)}
                  
                  {showBonusWinMessage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white rounded z-20 p-4">
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-3">Gratulujem! 🎉</h3>
                        <p className="text-base mb-2">
                          Podarilo sa ti nájsť 3 rovnaké symboly!
                        </p>
                        <div className="flex justify-center space-x-4 text-3xl my-4">
                          <span>☕</span>
                          <span>☕</span>
                          <span>☕</span>
                        </div>
                        <p className="text-sm text-white/90">
                          Tvoja cena ti bude odovzdaná už čoskoro! ❤️
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScratchCard;