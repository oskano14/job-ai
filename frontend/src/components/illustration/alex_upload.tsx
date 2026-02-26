import React from "react";
import img from "../../asset/alex_upload.png";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> { }

export function Alexupload(props: Props) {
    return <img src={img} alt="ALEX explain" {...props} />;
}
