import React from "react";
import AlexExplainImage from "../../asset/alex_explain.png";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> { }

export function AlexExplain(props: Props) {
    return <img src={AlexExplainImage} alt="ALEX EXPLAIN" {...props} />;
}
