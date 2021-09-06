<template>
    <div class="container center">
        <div class="grid grid-12 small-space">
            <div class="grid-column">
                <form class="contact-us-form">
                    <h2>Get In Contact With Us</h2>
                    <br/>
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input type="text" class="form-control" id="name" placeholder="Enter Name" required>
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" class="form-control" id="email" placeholder="Enter Email" required>
                    </div>

                    <div class="form-group">
                        <label for="message">Message</label>
                        <textarea class="form-control" id="message" rows="3" placeholder="Enter Message" required></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Submit</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name:"contact",
    data(){
        return {
        }
    },
  mounted () {
    
  },
}
</script>
<style lang="scss" scoped>
    .contact-us-form {
        width: 500px;
        margin: 0 auto;
        margin-top: 130px;
        label {
            text-align: left;
        }

        input[type=text] {
            padding: 0 12px;
        }

        input[type=text]::placeholder { 
            font-size: 0.8rem !important;
            font-weight: 300;
            color: #777;
        }

        input, textarea {
            height: 50px;
            background-color: #1d2333;
            border: 1px solid #3f485f;
            color: #fff !important;
            transition: border-color .2s ease-in-out;
            width: 100%;
            border-radius: 10px !important;
            font-size: 0.8rem !important;
            font-weight: 300;
            font-family: Rajdhani, sans-serif;
        }

        textarea {
            min-height: 200px;
        }

        button {
            background-color: #7750f8;
            box-shadow: 4px 7px 12px 0 rgb(119 80 248 / 20%);
            height: 50px;
        }
    }

    @media screen and (max-width: 768px) {
        .contact-us-form {
            width: 400px;
        }
    }

    @media screen and (max-width: 600px) {
        .contact-us-form {
            width: 280px;
        }
    }
</style>