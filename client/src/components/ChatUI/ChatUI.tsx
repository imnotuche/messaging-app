import CurrentChat from "./CurrentChat";
import AllChats from "./AllChats";

function ChatUI(){

    return (

        <>
            <div className="
                md:flex flex-1
                w-full lg:h-full
                p-3 md:pb-0 lg:pb-3 lg:pl-0               
            ">

                <CurrentChat/>
                {/*<AllChats/>*/}
                
            </div>
        </>

    );

}

export default ChatUI;