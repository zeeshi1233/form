import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
function Pdf() {
  let pic=localStorage.getItem("uPic")
const pdfref=useRef();
const downloadPDF=()=>{

  const input=pdfref.current;
  html2canvas(input).then((canvas)=>{
    const imgData=canvas.toDataURL('image/png');
    const pdf=new jsPDF('p','mm','a4',true);
    const pdfWidth=pdf.internal.pageSize.getWidth();
    const pdfHeight=pdf.internal.pageSize.getHeight();
const imgWidth=canvas.width;
const imgHeight=canvas.height;
const ratio=Math.min(pdfWidth/imgWidth,pdfHeight/imgHeight);
const imgX=(pdfWidth-imgWidth*ratio)/2;
const imgY=30;
pdf.addImage(imgData,'PNG',imgX,imgY,imgWidth*ratio,imgHeight*ratio);
pdf.save('std.pdf');

})
};

  return(
<>

<div class="flex justify-center items-center   p-10 md:py-16" ref={pdfref}> 
<div class="bg-white w-full md:w-4/5 shadow flex justify-center max-w-7xl border-2 border-t-green-500 border-b-green-500 border-l-slate-700 border-r-slate-700  "> 
<div class=""> 
<h3 class="text-teal-600 text-1xl md:text-2xl font-bold  ml-4">ID Card </h3>
 <div class="flex items-center justify-center space-x-40">
   <div class="mr-5 mt-5 flex flex-col items-center justify-between lg:flex-row bg-white">
     <div class="px-5 text-black flex flex-col w-full lg:w-[100%] ">
        <div class="text-left mb-8 mr-5">
         <h1 class=" text-lg "> <span className="text-teal-600"> Name </span>: <span className="font-bold" > Harried Mitchell </span></h1>
         <h1 class=" text-lg "> <span className="text-teal-600"> Roll No </span>:<span className="font-bold" > 4444 </span></h1>
         <h1 class=" text-lg "> <span className="text-teal-600" > City </span>: <span className="font-bold" > Karachi </span></h1>
         
          </div> 
          </div>
           </div> 
           <div className="mb-8" >
          <img id="img"  src={pic} class="h-28 w-36 mb-8 -mt-7" alt="" /> 
           </div>           
           </div> 
           <div className="flex justify-between items-end">
<div>
           <span className="text-center bg-gray-700 pl-3 pr-3 text-white">
 Q3
</span>
           <span className="text-center bg-green-800 pl-3 pr-3  text-white">
 WMD
</span>
</div>
  <div>

           <h5 className="text-end mb-5  ">
  <span className="border-2 border-t-black border-b-0 border-r-0 border-l-0 pl-5 text-center p-2"> Authorized Sign</span>
</h5>
  </div>

           </div>
           </div> 
           </div>
          </div>
          <button onClick={downloadPDF} >Download</button>
</>


  )

}
export default Pdf;