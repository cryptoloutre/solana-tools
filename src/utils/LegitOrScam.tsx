import { FC, useEffect, useState } from 'react';
import { legitNFTlist } from './firstCreatorNFTList/legitNFTlist';
import { scamNFTlist } from './firstCreatorNFTList/scamNFTlist';

type Props = {
    firstCreator: string;
};

export const LegitOrScam: FC<Props> = ({
    firstCreator,
}) => {
    const [isVerified, setIsVerfied] = useState(false);
    const [isScam, setIsScam] = useState(false);

    const legitList = legitNFTlist;
    const scamList = scamNFTlist;

    useEffect(() => {
        for (let i = 0; i < legitList.length; i++) {
            if (legitList[i] == firstCreator) {
                setIsVerfied(true)
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
            {isVerified && <div className='text-[#16c60c] font-semibold sm:text-base text-left mr-3'>✔ Verified</div>}

            {isScam && <div className='text-[#F03A17] font-semibold sm:text-base text-left mr-3'>❗ Scam</div>}

            {!isVerified && !isScam && <div className='text-[#ff7f00] font-semibold sm:text-base text-left mr-3'><strong>?</strong> No information</div>}
        </div>
    );
};


