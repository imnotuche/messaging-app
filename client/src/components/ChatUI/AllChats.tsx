import Avatar from "../UI/Avatar";

function AllChats(){

    return (

        <>

            <div className="
                bg-[#f5ede6]
                relative overflow-hidden
                flex flex-col
                h-full w-[30%]
                border-l border-[#240f04] rounded-xl 
                ml-3
            ">

                <div className="
                    bg-[#8c6a56]/10 backdrop-blur-sm
                    absolute top-0
                    flex items-center
                    w-full h-16
                    pl-8
                    text-xl font-semibold
                ">Chats</div>

                <div className="
                    flex-1 w-full
                    overflow-y-scroll
                    scrollbar-light
                    my-16 p-3
                ">

                    <div className="
                        w-full
                    ">

                        <div className="
                            flex items-center
                            w-[100%] h-16 mb-3
                        ">

                            <Avatar/>

                            <div className="
                                w-[70%] ml-2
                            ">

                                <p className="
                                    text-m font-semibold text-[#240f04]
                                    truncate
                                    leading-5
                                    mb-[2px]
                                ">Uchechukwu ekwe long ass name</p>

                                <p className="
                                    text-sm font-medium text-[#a07050]
                                    truncate
                                    leading-5
                                ">some long ass message to be truncated</p>

                            </div>

                            <div className="
                                flex flex-col flex-1
                                justify-center items-end
                            ">
                                <p className="
                                    text-sm font-semibold text-[#a07050]
                                ">3:41</p>

                                <div className="
                                    bg-[#240f04]
                                    flex justify-center items-center
                                    h-6 aspect-square
                                    pb-[2px] my-[2px]
                                    rounded-full
                                    text-sm font-semibold text-[#f5ede6]
                                ">2</div>

                            </div>

                        </div>


                    </div>

                </div>

                <div className="
                    bg-[linear-gradient(to_bottom,#f5ede600_0%,#f5ede6_90%)]
                    absolute bottom-0
                    flex items-center
                    w-full h-12
                "></div>

            </div>

        </>

    );

}

export default AllChats;