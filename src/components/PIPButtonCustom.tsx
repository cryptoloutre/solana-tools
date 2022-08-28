import { FC, useState } from "react";
import styles from "./index.module.css";
import { PIPButton } from "@getpip/react-pip-button";


export const PIPButtonCustom: FC = ({ }) => {

  const [isClicked, setIsClicked] = useState(false);
  const [tipAmount, setTipAmount] = useState('1');
  const [currency, setCurrency] = useState('SOL');
  const [message, setMessage] = useState('');

  const handleChange = (e: any) => {
    setCurrency(e.target.value)
  }

  return (



    <div>
      <button className="w-[169px] h-[50px] bg-[#1149ff] mb-[10px] hover:bg-[#0e3ed9] rounded-xl shadow-xl font-semibold text-lg" onClick={() => setIsClicked(true)}>
        <div>Support us</div>
        <div className="flex justify-center">
          <p className="text-xs font-semibold">Powered by</p>
          <svg width="46" height="17" viewBox="0 0 46 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.13691 0C3.87752 0 0.160156 3.78525 0.160156 8.85376V22.7252C0.160156 22.9657 0.191823 23 0.435517 23H2.42156H4.40759C4.64853 23 4.68295 22.9684 4.68295 22.7252V17.7075H8.95793C14.4941 17.7075 18.1825 13.958 18.1825 8.92384C18.1825 3.78524 14.355 0 9.13691 0ZM9.13691 4.1672C11.9896 4.1672 13.6597 6.21165 13.6597 8.88811C13.6597 11.5618 11.9896 13.5417 8.96206 13.5417H4.68295V8.85376C4.68295 6.21577 6.24563 4.1672 9.13691 4.1672ZM36.8079 0C31.5486 0 27.8312 3.78525 27.8312 8.85376V22.7252C27.8312 22.9657 27.8629 23 28.1065 23H30.0926H32.0786C32.3196 23 32.354 22.9684 32.354 22.7252V17.7075H36.629C42.1651 17.7075 45.8535 13.958 45.8535 8.92383C45.8535 3.78524 42.026 0 36.8079 0ZM36.8079 4.1672C39.6607 4.1672 41.3307 6.21165 41.3307 8.88811C41.3307 11.5618 39.6607 13.5417 36.6331 13.5417H32.354V8.85376C32.354 6.21577 33.9167 4.1672 36.8079 4.1672ZM20.2597 5.65527C20.2597 5.48959 20.394 5.35527 20.5597 5.35527H24.5031C24.6688 5.35527 24.8031 5.48959 24.8031 5.65527V17.4209C24.8031 17.5865 24.6688 17.7209 24.5031 17.7209H20.5597C20.394 17.7209 20.2597 17.5865 20.2597 17.4209V5.65527ZM22.5314 0C21.2794 0 20.2597 1.01498 20.2597 2.26702C20.2597 3.51907 21.2794 4.53405 22.5314 4.53405C23.7834 4.53405 24.8031 3.51907 24.8031 2.26702C24.8031 1.01498 23.7834 0 22.5314 0Z" fill="#0D1942"></path></svg>
        </div>
      </button>

      {isClicked && <div tabIndex={-1} className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 md:inset-0 h-modal md:h-full flex justify-center items-center">
        <div className="relative p-6 max-w-md h-full md:h-auto">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
            <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => { setIsClicked(false); setMessage('') }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
            <div className="p-6 text-center bg-[#15263F] shadow-xl rounded-xl">

              <label className="flex mb-[2px] font-semibold text-lg">Select Currency</label>
              <select className="mb-[10px] w-full text-black pl-1 border-2 border-black rounded-lg" value={currency} onChange={handleChange}>
                <option className="font-semibold text-lg" value="SOL">SOL</option>
                <option className="font-semibold text-lg" value="USDC">USDC</option>
                <option className="font-semibold text-lg" value="PIP">PIP</option>
                <option className="font-semibold text-lg" value="RAY">RAY</option>
              </select>

              <label className="flex mb-[2px] font-semibold text-lg">Amount</label>
              <input className="mb-[10px] w-full text-black pl-1 border-2 border-black rounded-lg"
                type="text"
                required
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
              />


              <div className="flex justify-center mt-[2px]">
                <PIPButton
                  receiver="STJ7LxTepj3V3YrW1Qz4oT3F1ZK2B4wYKnYpUZyUnUp"
                  amount={tipAmount}
                  currency={currency}
                  label="SUPPORT US"
                  onPayment={() => setMessage('Thanks for the support ❤️')}
                />
              </div>

              {message != '' &&
                <div className="mt-[5px]">{message}</div>
              }

              <div className="flex justify-center mt-[10px]">
                <p className="text-xs font-semibold">Powered by </p>
                <a target="_blank" rel="noreferrer" href="https://www.getpip.com/">
                  <svg width="46" height="19" viewBox="0 0 46 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M9.13691 0C3.87752 0 0.160156 3.78525 0.160156 8.85376V22.7252C0.160156 22.9657 0.191823 23 0.435517 23H2.42156H4.40759C4.64853 23 4.68295 22.9684 4.68295 22.7252V17.7075H8.95793C14.4941 17.7075 18.1825 13.958 18.1825 8.92384C18.1825 3.78524 14.355 0 9.13691 0ZM9.13691 4.1672C11.9896 4.1672 13.6597 6.21165 13.6597 8.88811C13.6597 11.5618 11.9896 13.5417 8.96206 13.5417H4.68295V8.85376C4.68295 6.21577 6.24563 4.1672 9.13691 4.1672ZM36.8079 0C31.5486 0 27.8312 3.78525 27.8312 8.85376V22.7252C27.8312 22.9657 27.8629 23 28.1065 23H30.0926H32.0786C32.3196 23 32.354 22.9684 32.354 22.7252V17.7075H36.629C42.1651 17.7075 45.8535 13.958 45.8535 8.92383C45.8535 3.78524 42.026 0 36.8079 0ZM36.8079 4.1672C39.6607 4.1672 41.3307 6.21165 41.3307 8.88811C41.3307 11.5618 39.6607 13.5417 36.6331 13.5417H32.354V8.85376C32.354 6.21577 33.9167 4.1672 36.8079 4.1672ZM20.2597 5.65527C20.2597 5.48959 20.394 5.35527 20.5597 5.35527H24.5031C24.6688 5.35527 24.8031 5.48959 24.8031 5.65527V17.4209C24.8031 17.5865 24.6688 17.7209 24.5031 17.7209H20.5597C20.394 17.7209 20.2597 17.5865 20.2597 17.4209V5.65527ZM22.5314 0C21.2794 0 20.2597 1.01498 20.2597 2.26702C20.2597 3.51907 21.2794 4.53405 22.5314 4.53405C23.7834 4.53405 24.8031 3.51907 24.8031 2.26702C24.8031 1.01498 23.7834 0 22.5314 0Z" fill="#1149ff"></path></svg>
                </a>

              </div>
            </div>
          </div>
        </div>
      </div>}

    </div>
  );
};