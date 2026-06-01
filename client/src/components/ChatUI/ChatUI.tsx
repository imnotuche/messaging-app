import CurrentChat from "./CurrentChat";
import AllChats from "./AllChats";

function ChatUI(){

    return (

        <>
            <div className="
                overflow-hidden
                relative md:static
                flex flex-1
                w-full
                m-2.5 md:m-3 mb-0 md:mb-0 lg:mb-3 lg:ml-0            
            ">

                <CurrentChat/>
                {/*<AllChats/>*/}
                <AllChats/>
                
            </div>
        </>

    );

}

export default ChatUI;