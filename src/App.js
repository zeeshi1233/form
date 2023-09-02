import './App.css';
import {
  Select, Option, Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import React, { useState, useRef } from 'react';
import { Modal, Upload } from 'antd';
import { db, collection, addDoc, getDocs, ref, uploadBytes, storage, getDownloadURL, setDoc, doc } from './config/firebase';
import Admin from './admin/index';
import Swal from 'sweetalert2';
import PrintableComponent from './component/PDFFile';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function App() {


  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(!open);
  const [selectedGender, setSelectedGender] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([]);

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };
  let latestFile;
  const handleChange = ({ fileList: newFileList }) => {
    if (newFileList.length > 0) {
      latestFile = newFileList[newFileList.length - 1];
      setFileList([latestFile]);
      console.log(latestFile);
    } else {
      setFileList([]);

    }
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };



  const handleSubmit = async () => {




    let name = document.getElementById("name");
    let email = document.getElementById("email");
    let fname = document.getElementById("fname");
    let city = document.getElementById("city");
    let cnic = document.getElementById("cnic");
    let phone = document.getElementById("phone");
    let dob = document.getElementById("dob");
    let qualification = document.getElementById("qualification");
    let address = document.getElementById("address");
    let gender = document.getElementById("gender");
    let errorMsg = ""
    if (!name.value || !email.value || !fname.value || !city.value || !cnic.value || !phone.value || !dob.value || !qualification.value || !address.value || !gender.value) {
      if (!name.value) errorMsg += "- Name\n";
      if (!email.value) errorMsg += "- Email\n";
      if (!fname.value) errorMsg += "- Father Name\n";
      if (!city.value) errorMsg += "- City\n";
      if (!cnic.value) errorMsg += "- CNIC\n";
      if (!phone.value) errorMsg += "- Phone\n";
      if (!dob.value) errorMsg += "- Date of Birth\n";
      if (!qualification.value) errorMsg += "- Qualification\n";
      if (!address.value) errorMsg += "- Address\n";
      if (!gender.value) errorMsg += "- Gender\n";

      Swal.fire({
        icon: 'error',
        title: 'Following Fields are Required.',
        text: `${errorMsg}`,
      })
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cnicPattern = /^\d{5}-\d{7}-\d{1}$/;
    const phonePattern = /^\d{11}$/;
    if (!fileList[0]) {
      Swal.fire({
        icon: 'error',
        title: 'Image Required.',
      })
    }

    // Validate email, CNIC, and phone number
    if (!emailPattern.test(email.value)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email Address.'
      })
      return;
    }
    if (!cnicPattern.test(cnic.value)) {
      Swal.fire({
        icon: 'error',
        title: "Invalid CNIC number. Format should be: 12345-1234567-1"
      })
      return;
    }
    if (!phonePattern.test(phone.value)) {
      Swal.fire({
        icon: 'error',
        title: "Invalid phone number. Phone number should be 11 digits long."
      })
      return;
    }


    let random;
    while (true) {
      random = Math.floor(Math.random() * 9000 + 1000);;

      // Check if the generated roll number exists in the database
      const rollNumberSnapshot = await getDocs(collection(db, "rollnumber"));
      let rollNumberExists = false;

      rollNumberSnapshot.forEach((doc) => {
        if (doc.data().roll === random) {
          rollNumberExists = true;
        }
      });

      if (!rollNumberExists) {
        break; // Break the loop if the roll number is unique
      }
    }

    try {
      const docRef = await addDoc(collection(db, "rollnumber"), {
        roll: random,
      });
      console.log("Document written with ID: ", docRef.id);

      // Rest of your code to add user data to Firestore
    } catch (e) {
      console.error("Error adding document: ", e);
    }


    console.log(random);




    try {
      const docRef = await addDoc(collection(db, "Students"), {
        name: name.value,
        email: email.value,
        fname: fname.value,
        city: city.value,
        cnic: cnic.value,
        phone: phone.value,
        DateOfBirth: dob.value,
        qualification: qualification.value,
        address: address.value,
        gender: gender.value,
        status: "painding",
        rollNumber: random,
        pic: ''
      });

      const storageRef = ref(storage, `images/${docRef.id}`);
      uploadBytes(storageRef, fileList[0].originFileObj).then((snapshot) => {
        console.log('Uploaded a blob or file!');

      }).then(() => {



        getDownloadURL(ref(storage, `images/${docRef.id}`))
          .then(async (url) => {
            await setDoc(doc(db, "Students", docRef.id), {
              name: name.value,
              email: email.value,
              fname: fname.value,
              city: city.value,
              cnic: cnic.value,
              phone: phone.value,
              DateOfBirth: dob.value,
              qualification: qualification.value,
              address: address.value,
              gender: gender.value,
              status: "painding",
              rollNumber: random,
              pic: url
            });
            let std={
              uid:docRef.id,
              pic:url
            }
            localStorage.setItem("Student",JSON.stringify(std))
            alert("data submited")
            setOpen(!open)
          })
          .catch((error) => {
            console.log(error);
          });
      })



    } catch (e) {
      console.error("Error adding document: ", e);
    }



  };



  return (
    <>


      <section className="text-gray-600 body-font relative">
        <div className="container px-5  mx-auto">
        <div class="container px-5 py-24 mx-auto flex flex-wrap">
    <div class="lg:w-2/3 mx-auto">
      <div class="flex flex-wrap w-full bg-gray-100 py-32 px-10 relative mb-4">
        <img alt="gallery" class="w-full object-cover h-full object-center block opacity-25 absolute inset-0" src="data:image/jpeg;base64,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" />
       
      </div>
      </div>
      </div>
          <div className="flex flex-col text-center w-full mb-12">
            <h1 className="sm:text-3xl text-2xl font-bold title-font mb-4 text-gray-900 ">Course Registration Form</h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">Service-Education-Registration</p>
          </div>
          <div className="lg:w-1/2 md:w-2/3 mx-auto">
            <div className="flex flex-wrap -m-2">
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label for="name" className="leading-7 text-sm text-gray-600">Full Name</label>
                  <input type="text" placeholder='Full Name' id="name" name="name" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label for="email" className="leading-7 text-sm text-gray-600">Email</label>
                  <input type="email" id="email" name="email" placeholder='Email' className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>

              <div className="p-2 w-1/2">
                <div className="relative">
                  <label for="fname" className="leading-7 text-sm text-gray-600">Father Name</label>
                  <input type="text" placeholder='Father Name' id="fname" name="fname" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>

              <div className="p-2 w-1/2">
                <div className="relative">
                  <label for="city" className="leading-7 text-sm text-gray-600">City</label>
                  <input type="text" placeholder='Select City' id="city" name="name" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label for="cnic" className="leading-7 text-sm text-gray-600">CNIC/BFORM</label>
                  <input type="text" placeholder='CNIC' id="cnic" name="cnic" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label for="phone" className="leading-7 text-sm text-gray-600">Phone</label>
                  <input type="number" placeholder='Phone' id="phone" name="phone" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label for="dob" className="leading-7 text-sm text-gray-600">Date of birth</label>
                  <input type="date" placeholder='Date of birth' id="dob" name="dob" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>
              <div className="p-2 w-1/2">
                <div className="relative">
                  <label className="leading-7 text-sm text-gray-600">Gender</label>
                  <div className="w-ful">
                    <select
                      id="gender"
                      value={selectedGender}
                      onChange={handleGenderChange}
                      className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-2 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    >
                      <option value=''>Select Gender</option>
                      <option value='Male'>Male</option>
                      <option value='Female'>Female</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-2 w-full">
                <div className="relative">
                  <label for="qualification" className="leading-7 text-sm text-gray-600">Qualification</label>
                  <input type="text" placeholder='Qualification' id="qualification" name="qualification" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>


              <div className="p-2 w-full">
                <div className="relative">
                  <label for="Address" className="leading-7 text-sm text-gray-600">Address</label>
                  <input type="text" placeholder='Address' id="address" name="address" className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out" />
                </div>
              </div>
              <div className="p-2 w-full">
                <div className="relative">
                  <label for="Address" className="leading-7 text-sm text-gray-600">Picture</label>
                  <Upload
                    action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    id='img' >
                    {fileList.length === 0 && 'Upload'} {/* Corrected condition */}
                  </Upload>
                  <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                    <img
                      alt="example"
                      style={{
                        width: '100%',
                      }}
                      src={previewImage}
                    />
                  </Modal>
                </div>
              </div>

              <div className="p-2 w-full">
                <button onClick={handleSubmit} className="flex mx-auto text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">Submit</button>

                <Button onClick={handleOpen} variant="gradient">
                  Open Dialog
                </Button>
                <Dialog
                  open={open}
                  handler={handleOpen}
                  animate={{
                    mount: { scale: 1, y: 0 },
                    unmount: { scale: 0.9, y: -100 },
                  }}
                >
                  <DialogHeader className='flex justify-center' >Form Submit Successfully.</DialogHeader>
                  <DialogBody divider>
                   <PrintableComponent></PrintableComponent>

                  </DialogBody>
                  <DialogFooter>
                    <Button
                      variant="text"
                      color="red"
                      onClick={handleOpen}
                      className="mr-1"
                    >
                      <span>Cancel</span>
                    </Button>
                 
                  </DialogFooter>
                </Dialog>

              </div>

            </div>
          </div>
        </div>
      </section>



      <Admin />

    </>

  );


}

export default App;
