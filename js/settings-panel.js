$(function () {

    $(".settings-panel #color-og").click(function () {
        $("link#theme-styles").attr("href", "css/style-orange-gray.css");
        return false;
    });

    $(".settings-panel #color-roll").click(function () {
        $("link#theme-styles").attr("href", "css/style-roll.css");
        return false;
    });


    $(".settings-toggle #toggle").click(function () {
        $(".settings-panel").fadeToggle({
            duration: 300
        });

        if ($(".settings-toggle").hasClass('toggled') === false) {
            $(".settings-toggle").addClass("toggled")
                .children(".glyphicons")
                .removeClass("tint")
                .addClass("remove_2");
        } else {
            $(".settings-toggle")
                .removeClass("toggled")
                .children(".glyphicons")
                .addClass("tint")
                .removeClass("remove_2");
        }

        return false;
    });
});