import React from 'react';

const GlassFilter = () => {
    return (
        <svg className="glass-filter" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
            <defs>
                <filter id="glassFilter" colorInterpolationFilters="sRGB">
                    {/* RED channel with strongest displacement */}
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="map"
                        id="redchannel"
                        xChannelSelector="R"
                        yChannelSelector="G"
                        scale="10"
                        result="dispRed"
                    />
                    <feColorMatrix
                        in="dispRed"
                        type="matrix"
                        values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
                        result="red"
                    />

                    {/* GREEN channel (reference / least displaced) */}
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="map"
                        id="greenchannel"
                        xChannelSelector="R"
                        yChannelSelector="G"
                        scale="5"
                        result="dispGreen"
                    />
                    <feColorMatrix
                        in="dispGreen"
                        type="matrix"
                        values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
                        result="green"
                    />

                    {/* BLUE channel with medium displacement */}
                    <feDisplacementMap
                        in="SourceGraphic"
                        in2="map"
                        id="bluechannel"
                        xChannelSelector="R"
                        yChannelSelector="G"
                        scale="7"
                        result="dispBlue"
                    />
                    <feColorMatrix
                        in="dispBlue"
                        type="matrix"
                        values="0 0 0 0 0
                    0 0 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
                        result="blue"
                    />

                    {/* Blend channels back together */}
                    <feBlend in="red" in2="green" mode="screen" result="rg" />
                    <feBlend in="rg" in2="blue" mode="screen" result="output" />

                    {/* Slight blur for smoothing */}
                    <feGaussianBlur in="output" stdDeviation="0.5" />
                </filter>
            </defs>
        </svg>
    );
};

export default GlassFilter;
