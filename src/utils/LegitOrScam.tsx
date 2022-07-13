import { FC, useEffect, useState } from 'react';
import { legitNFTlist } from './firstCreatorNFTList/legitNFTlist';
import { scamNFTlist } from './firstCreatorNFTList/scamNFTlist'

type Props = {
    firstCreator: string;
};

export const LegitOrScam: FC<Props> = ({
    firstCreator,
}) => {
    const [isLegit, setIsLegit] = useState(false);
    const [isScam, setIsScam] = useState(false);

    const legitList = legitNFTlist;
    const scamList = scamNFTlist;


    useEffect(() => {
        for (let i = 0; i < legitList.length; i++) {
            if (legitList[i] == firstCreator) {
                setIsLegit(true)
                break
            }
        }

        for (let i = 0; i < scamList.length; i++) {
            if (scamList[i] == firstCreator) {
                setIsScam(true)
                break
            }
        }
    }, []);

    return (
        <div>
            {isLegit && <div className='text-[#16c60c] font-semibold text-base text-left mr-3'>✔ Legit</div>}

            {isScam && <div className='text-[#F03A17] font-semibold text-base text-left mr-3'>❗ Scam</div>}

            {!isLegit && !isScam && <div className='text-[#ff7f00] font-semibold text-base text-left mr-3'><strong>?</strong> No information</div>}
        </div>
    );
};


