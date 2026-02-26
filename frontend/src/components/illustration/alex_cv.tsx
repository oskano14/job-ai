import React from "react";
import AlexCvImage from "../../asset/alex_cv.png";
interface Props extends React.ImgHTMLAttributes<HTMLImageElement> { }
export function AlexCV(props: Props) {
    return <img src={AlexCvImage} alt="Alex cv"{...props} />;
}
