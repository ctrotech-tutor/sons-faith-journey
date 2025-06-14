import React from 'react'
import { useAuth } from '@/lib/hooks/useAuth';
import { User, HashIcon, Mail, Lock, Phone, LocateIcon, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-white dark:bg-gray-900 justify-between group/design-root overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <div>
        <div className="flex items-center bg-white dark:bg-gray-900 p-4 pb-2 justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="ripple-effect text-white rounded-full w-8 h-8 bg-purple-600 hover:bg-purple-600 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-[#0d0f1c] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Sign Up</h2>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl">
              <input
                placeholder="Full Name"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] dark:bg-gray-800 focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] dark: focus:border-none h-14 placeholder:text-[#47569e] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                value=""
                type="Full Name"
              />
              <div
                className="text-[#47569e] flex border-none bg-[#e6e9f4] dark:bg-gray-800 dark:text-purple-200 items-center justify-center pr-4 rounded-r-xl border-l-0"
                data-icon="User"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"
                  ></path>
                </svg>
              </div>
            </div>
          </label>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl">
              <input
                placeholder="Username"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                value=""
              />
              <div
                className="text-[#47569e] flex border-none bg-[#e6e9f4] items-center justify-center pr-4 rounded-r-xl border-l-0"
                data-icon="Hash"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M224,88H175.4l8.47-46.57a8,8,0,0,0-15.74-2.86l-9,49.43H111.4l8.47-46.57a8,8,0,0,0-15.74-2.86L95.14,88H48a8,8,0,0,0,0,16H92.23L83.5,152H32a8,8,0,0,0,0,16H80.6l-8.47,46.57a8,8,0,0,0,6.44,9.3A7.79,7.79,0,0,0,80,224a8,8,0,0,0,7.86-6.57l9-49.43H144.6l-8.47,46.57a8,8,0,0,0,6.44,9.3A7.79,7.79,0,0,0,144,224a8,8,0,0,0,7.86-6.57l9-49.43H208a8,8,0,0,0,0-16H163.77l8.73-48H224a8,8,0,0,0,0-16Zm-76.5,64H99.77l8.73-48h47.73Z"
                  ></path>
                </svg>
              </div>
            </div>
          </label>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl">
              <input
                placeholder="Email"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                value=""
              />
              <div
                className="text-[#47569e] flex border-none bg-[#e6e9f4] items-center justify-center pr-4 rounded-r-xl border-l-0"
                data-icon="Envelope"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z"
                  ></path>
                </svg>
              </div>
            </div>
          </label>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl">
              <input
                placeholder="Password"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                value=""
              />
              <div
                className="text-[#47569e] flex border-none bg-[#e6e9f4] items-center justify-center pr-4 rounded-r-xl border-l-0"
                data-icon="Lock"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"
                  ></path>
                </svg>
              </div>
            </div>
          </label>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl">
              <input
                placeholder="Phone Number"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                value=""
              />
              <div
                className="text-[#47569e] flex border-none bg-[#e6e9f4] items-center justify-center pr-4 rounded-r-xl border-l-0"
                data-icon="Phone"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"
                  ></path>
                </svg>
              </div>
            </div>
          </label>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl">
              <input
                placeholder="Location"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                value=""
              />
              <div
                className="text-[#47569e] flex border-none bg-[#e6e9f4] items-center justify-center pr-4 rounded-r-xl border-l-0"
                data-icon="MapPin"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M128,64a40,40,0,1,0,40,40A40,40,0,0,0,128,64Zm0,64a24,24,0,1,1,24-24A24,24,0,0,1,128,128Zm0-112a88.1,88.1,0,0,0-88,88c0,31.4,14.51,64.68,42,96.25a254.19,254.19,0,0,0,41.45,38.3,8,8,0,0,0,9.18,0A254.19,254.19,0,0,0,174,200.25c27.45-31.57,42-64.85,42-96.25A88.1,88.1,0,0,0,128,16Zm0,206c-16.53-13-72-60.75-72-118a72,72,0,0,1,144,0C200,161.23,144.53,209,128,222Z"
                  ></path>
                </svg>
              </div>
            </div>
          </label>
        </div>
        <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
          <label className="flex flex-col min-w-40 flex-1">
            <div className="flex w-full flex-1 items-stretch rounded-xl">
              <input
                placeholder="Expectations"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d0f1c] focus:outline-0 focus:ring-0 border-none bg-[#e6e9f4] focus:border-none h-14 placeholder:text-[#47569e] p-4 rounded-r-none border-r-0 pr-2 text-base font-normal leading-normal"
                value=""
              />
              <div
                className="text-[#47569e] flex border-none bg-[#e6e9f4] items-center justify-center pr-4 rounded-r-xl border-l-0"
                data-icon="Question"
                data-size="24px"
                data-weight="regular"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                  <path
                    d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"
                  ></path>
                </svg>
              </div>
            </div>
          </label>
        </div>
        <div className="flex px-4 py-3">
          <button
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#e6e9f4] text-[#0d0f1c] dark:shadow-lg dark:bg-gray-800 dark:text-purple-200 gap-2 pl-5 text-base font-bold leading-normal tracking-[0.015em]"
          >
            <div className="text-[#0d0f1c] dark:bg-purple-200" data-icon="GoogleLogo" data-size="24px" data-weight="regular">
              <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256" className='dark:fill-purple-200'>
                <path d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z"></path>
              </svg>
            </div>
            <span className="truncate">Continue with Google</span>
          </button>
        </div>
        <div className="flex px-4 py-3">
          <button
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-purple-700 dark:bg-purple-700 text-[#f8f9fc] text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Sign Up</span>
          </button>
        </div>
      </div>
      <div>
        <p className="text-[#47569e] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">Already have an account?</p>
        <p className="text-[#47569e] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center underline">Log In</p>
        <div className="h-5 bg-[#f8f9fc] dark:bg-gray-900"></div>
      </div>
    </div>
  )
}

export default Signup