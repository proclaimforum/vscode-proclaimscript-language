#=== 
# Test Proclaim Script File
# Burnside Consulting 6/8/2019 
#
# just a sample proclaim script file to test out VSCode Language Extension
#=====
# Changelog 
# BC 7/9/19 added IF ELSEIF ELSE END
#=====
# Define some variables
#=====
variable1 = 0 
#hmm, numbers in variable names are highlighted as numbers
v-var = 1 
v-continue = TRUE 
vcontinuewhile = 1 
#=====
# result keyword - case insensitive
# (nb not in native Proclaim syntax highlighter, but added here as it is useful )
result = "OK" 
#=====
# combined keyword, number and DBField
#=====
PUT( 10 , {mt field name.Number} ) 
#=====
# variables, strings and numbers
#=====
v-email = "info@proclaimforum.co.uk" 
i = 1 
j = 1.1
#=====
# IF ELSE END
#=====
IF v-continue = 1 THEN 
#=====
# longer keywords, inter-dispersed with numbers and DB Fields
#=====
    SEND E-MAIL (NONE) AT (v-email) SUBJECT (autostart) TO (INTERNAL OFFICE COMMUNICATION) COST UNITS (0.00) DETAIL (test email with field {case.key}) CASE (CURRENT-CASE) 
END 
#=====
# Maths field assign to variable
#=====
# other keywords
#=====
HTTPSERVICE( "test1x1" ) 
# do something with return-value and other 'special' variables?
v-httpresult = return-value 
#=====
# more code folding test
#=====
IF emaildebug = 1 THEN 
        vtxt = "test " + TEXT( return-value ) 
        PUT( vtxt , {temp logfile input alpha.Text} ) 
        vrun = {M write to log.Text} 
    END 
    #==== 
    # check the HTTPSERVICE ran ok 
    #==== 
    IF v-httpresult = "" OR v-httpresult = " " THEN 
        #webservice ran ok 
        v-allok = 1  
    ELSE 
        #webservice error 
        v-allok = 0 
        RESULT = "ERROR in calling HTTP Service: " + TEXT( v-httpresult ) 
    END 
    IF v-allok = 1 THEN 
         vdup = "" 
        # check 
        vdup = {M 2.Text} 
        IF vdup = "OK" THEN  
        ELSE 
            result = TEXT( vdup ) 
            v-allok = 0 
        END 
    END  
ELSE 
    #=== 
    # SQL error or no cases returned  - 
    IF v-casecount = 0 THEN 
        result = "ERROR - NO CASES returned by search"  
    ELSE 
        RESULT = "ERROR -  search SQL failed for some reason:" + TEXT( v-sql ) 
    END 
    SEND E-MAIL (NONE) AT (v-email) SUBJECT (SQLerror or no cases - v-casecount) TO (INTERNAL OFFICE COMMUNICATION) COST UNITS (0.00) DETAIL (started autoroutine) CASE (CURRENT-CASE) 
END 
#
IF 1=1 THEN
#stuff
ELSEIF 1=2 then
#n
ELSE
#junk
END
IF this THEN
    test
ELSE
    more testing
END
