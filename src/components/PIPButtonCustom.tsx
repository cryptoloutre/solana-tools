import { FC, useState } from "react";
import styles from "./index.module.css";
import { PIPButton } from "@getpip/react-pip-button";

const PIPButtonCustom: FC = () => {

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
        <div>Support Us</div>
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
                  receiver="Fdx5sKBwGC9aTioqghXZJzG7eDrPC5J6A4owc3ohYYkE"
                  amount={tipAmount}
                  currency={currency}
                  label="SUPPORT US"
                  onPayment={() => setMessage('Thanks for the support ❤️')}
                />
              </div>

              {message != '' &&
                <div className="mt-[5px]">{message}</div>
              }

            </div>
          </div>
        </div>
      </div>}

    </div>
  );
};

export default PIPButtonCustom;
