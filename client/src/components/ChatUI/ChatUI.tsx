import CurrentChat from "./CurrentChat";
import AllChats from "./AllChats";

function ChatUI(){

    return (

        <>
            <div className="
                flex flex-1
                w-[full] h-[full]
                m-3 ml-0               
            ">

                <CurrentChat/>
                <AllChats/>
                
            </div>
        </>

    );

}

export default ChatUI;