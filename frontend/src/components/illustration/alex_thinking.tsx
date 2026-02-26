import React from "react";
import AlexThinkingImage from "../../asset/alex_thinking.png";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> { }

export function AlexThinking(props: Props) {
    return <img src={AlexThinkingImage} alt="ALEX thinking" {...props} />;
}
