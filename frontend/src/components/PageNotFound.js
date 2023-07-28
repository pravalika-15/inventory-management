import React from "react";
import gif from "../assets/images/gifPage.gif";
const PageNotFound = () => {
  return (
    <div className="h-screen flex items-center justify-center">
      <img className=" h-1/2 w-auto" src={gif} alt="404 - Page Not Found" />
    </div>
  );
};

export default PageNotFound;
